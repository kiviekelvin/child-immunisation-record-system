// Supabase-backed authentication service
// Same exported function names as the old localStorage version,
// so most of the app can call this the same way — with one exception:
// getCurrentUser() is now ASYNC (it wasn't before). Any caller doing
// `const user = authService.getCurrentUser()` must become
// `const user = await authService.getCurrentUser()`.

import { supabase } from './supabaseClient';

export const authService = {
  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Fetch the matching profile row (role, approval_status, full_name)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new Error('Could not load user profile');
    }

    // Block sign-in for healthcare workers still awaiting approval
    if (profile.role === 'healthcare_worker' && profile.approval_status !== 'approved') {
      await supabase.auth.signOut();
      throw new Error('Your account is still pending admin approval');
    }

    return {
      id: data.user.id,
      email: data.user.email,
      full_name: profile.full_name,
      role: profile.role,
      approval_status: profile.approval_status,
      created_at: profile.created_at,
    };
  },

  // Sign up user
  // userData = { email, password, full_name, role }
  // Parents are auto-approved by the DB trigger; healthcare_worker signups
  // land as 'pending' until an admin approves them (see updateRegistrationStatus).
  signUp: async (userData) => {
    const { email, password, full_name, role } = userData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.user?.id,
      email,
      full_name,
      role,
      status: role === 'parent' ? 'approved' : 'pending',
    };
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  // Get current user (ASYNC now — callers must await this)
  getCurrentUser: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      full_name: profile.full_name,
      role: profile.role,
      approval_status: profile.approval_status,
      created_at: profile.created_at,
    };
  },

  // Get healthcare worker registrations (pending, approved, and rejected)
  // so the admin UI can show counts for all three, not just pending.
  // Admin-only: enforced by the RLS policy on `profiles`, not by this code.
  getPendingRegistrations: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'healthcare_worker')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Update the current user's profile (currently just full_name)
  updateProfile: async (updates) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      throw new Error('Not signed in');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Send a password reset email to the given address
  sendPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
  },

  // Get all parent accounts, for staff to select when linking a new patient
  // to their parent/guardian. Requires the "Staff can view parent profiles"
  // RLS policy — will return an empty list (not an error) for non-staff.
  getParents: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'parent')
      .order('full_name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};