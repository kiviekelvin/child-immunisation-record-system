# 🏥 Child Immunisation Record System (CIRS)

A comprehensive web-based system for managing child immunization records, designed for healthcare facilities, healthcare workers, and parents/guardians. Built with React and modern web technologies for easy deployment and maintenance.

![CIRS Dashboard](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=CIRS+Dashboard)

## ✨ Key Features

### 🔐 **Authentication & User Management**
- **Secure Login System** with role-based access control
- **User Registration** for parents and healthcare workers
- **Admin Approval System** for healthcare worker accounts
- **Automatic Route Protection** - Users are redirected to appropriate pages based on their role
- **Sign Out Functionality** with confirmation modal
- **Demo Accounts** for easy testing and demonstration

### 👩‍⚕️ **For Healthcare Workers**
- **Patient Management**: Register and manage patient records
- **Vaccination Scheduling**: Schedule and track vaccinations
- **Automated Reminders**: Get notified about due and overdue vaccinations
- **Comprehensive Reports**: Generate vaccination coverage reports
- **Mobile-Responsive Design**: Access from any device

### 👨‍👩‍👧‍👦 **For Parents/Guardians**
- **Child Records Access**: View vaccination history and schedules
- **Appointment Notifications**: See upcoming vaccinations
- **Digital Records**: Access vaccination certificates
- **Secure Portal**: Protected access to child health information

### 🔧 **For Administrators**
- **User Management**: Approve healthcare worker and parent accounts with confirmation dialogs
- **System Analytics**: Monitor vaccination coverage and trends
- **Data Management**: Comprehensive system oversight
- **Security Controls**: Manage system access and permissions

### 🎨 **User Experience Enhancements**
- **Modal Dialogs**: Professional modal popups replace browser alerts
- **Confirmation Dialogs**: User-friendly confirmation for important actions
- **Success/Error Notifications**: Beautiful modal notifications for all user feedback
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Polished transitions and micro-interactions

## 🛠 Technology Stack

- **Frontend**: React 18 with JSX
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom modal system with accessibility features
 - **Data Storage**: Supabase (Postgres) via `@supabase/supabase-js` — cloud-hosted backend
- **Authentication**: Supabase Auth with role-based profiles (uses a `profiles` table and RLS policies)
- **Charts**: Recharts for data visualization
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/child-immunisation-system.git
   cd child-immunisation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### 🎯 Demo Accounts

The system comes with pre-configured demo accounts for testing:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@cirs.demo` | `admin123` | Full system access, user management |
| **Healthcare Worker** | `nurse@cirs.demo` | `nurse123` | Patient management, vaccinations |
| **Parent** | `parent@cirs.demo` | `parent123` | View child records only |

## 📋 Usage Guide

### 🔑 **Getting Started**

1. **Login**: Use one of the demo accounts or register a new account
2. **Registration**: New healthcare workers require admin approval
3. **Navigation**: Use the sidebar to access different sections
4. **Sign Out**: Click the logout icon and confirm in the modal dialog

### 👥 **User Registration Process**

1. **For Parents**: 
   - Register directly and get immediate access
   - Can view their children's vaccination records

2. **For Healthcare Workers**:
   - Submit registration for admin approval
   - Wait for admin to approve the account via confirmation modal
   - Receive access to patient management features

3. **For Admins**:
   - Review pending registrations in "Pending Registrations"
   - Approve or reject healthcare worker applications with confirmation dialogs
   - Manage system users and settings

### 📊 **Core Functionality**

#### Patient Management
- Add new patients with complete demographic information
- Edit existing patient records (healthcare workers and admins only)
- View patient vaccination history
- Track parent/guardian information

#### Vaccination Scheduling
- Schedule vaccinations based on recommended timelines
- Track vaccination status (due, overdue, completed)
- Record administered vaccinations
- Add clinical notes and observations

#### Reporting & Analytics
- View vaccination completion rates
- Monitor overdue vaccinations
- Generate trend analysis
- Export data for external reporting

### 🔒 **Security & Access Control**

- **Role-Based Navigation**: Users only see menu items they have access to
- **Route Protection**: Automatic redirection if users try to access unauthorized pages
- **Session Management**: Secure login/logout with confirmation
- **Data Isolation**: Users only see data appropriate to their role

## 🌐 Deployment

### Easy Deployment Options

This application is designed for simple deployment without external dependencies:

#### **Option 1: Netlify (Recommended)**
1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Your app is live instantly!

#### **Option 2: Vercel**
1. Connect your GitHub repository to Vercel
2. Vercel automatically builds and deploys
3. Get a live URL in minutes

#### **Option 3: GitHub Pages**
1. Build the project: `npm run build`
2. Push the `dist` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings

#### **Option 4: Any Static Hosting**
- The built application is just static files
- Can be hosted on any web server
- No server-side requirements

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 💾 Data Storage (Supabase)

This project has been migrated from `localStorage` to Supabase (Postgres). Data and authentication are now backed by your Supabase project using the `@supabase/supabase-js` client.

✅ **Advantages:**
- Centralized cloud storage (Postgres) with row-level security (RLS)
- Built-in authentication and session handling via Supabase Auth
- Works across devices and users (multi-user support)

⚠️ **Important migration notes:**
- The codebase now expects a Supabase project and the following environment variables (see `.env.example`):

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

- Several service functions are now asynchronous. Callers that previously read from `localStorage` synchronously must be updated to `await` these methods. Notable examples:

   - `authService.getCurrentUser()` is now `async` and must be awaited by callers.
   - All methods on `dataService` are `async` and return Promises (e.g. `getPatients()`, `getVaccinationRecords()`).

- The project expects the following tables (names used in code): `profiles`, `patients`, `vaccinations`. RLS policies should be configured appropriately for production.

- Demo/demo-seeded accounts may still be present in the built `dist` bundle used for local demos; production Supabase data is separate and controlled via your Supabase project.

## 🧑‍💻 Developer: Supabase Schema & RLS Examples

-- WARNING: This schema is for context only and is not meant to be run as-is.
-- Table order and constraints may not be valid for execution.

```sql
CREATE TABLE public.profiles (
   id uuid NOT NULL,
   full_name text NOT NULL,
   role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'healthcare_worker'::text, 'parent'::text])),
   approval_status text NOT NULL DEFAULT 'pending'::text CHECK (approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
   created_at timestamp with time zone DEFAULT now(),
   email text,
   CONSTRAINT profiles_pkey PRIMARY KEY (id),
   CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.patients (
   id uuid NOT NULL DEFAULT gen_random_uuid(),
   parent_id uuid,
   full_name text NOT NULL,
   date_of_birth date NOT NULL,
   gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text])),
   created_by uuid,
   created_at timestamp with time zone DEFAULT now(),
   parent_name text,
   phone text,
   email text,
   address text,
   emergency_contact text,
   medical_notes text,
   CONSTRAINT patients_pkey PRIMARY KEY (id),
   CONSTRAINT patients_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.profiles(id),
   CONSTRAINT patients_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.vaccinations (
   id uuid NOT NULL DEFAULT gen_random_uuid(),
   patient_id uuid,
   vaccine_name text NOT NULL,
   due_date date NOT NULL,
   administered_date date,
   status text NOT NULL DEFAULT 'due'::text CHECK (status = ANY (ARRAY['due'::text, 'overdue'::text, 'completed'::text])),
   notes text,
   recorded_by uuid,
   created_at timestamp with time zone DEFAULT now(),
   administered_by text,
   CONSTRAINT vaccinations_pkey PRIMARY KEY (id),
   CONSTRAINT vaccinations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
   CONSTRAINT vaccinations_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id)
);
```

Example row-level security (RLS) policies to get started. Adapt to your security model and test thoroughly.

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- Profiles: allow users to select their own profile
CREATE POLICY "Profiles: select own" ON public.profiles
   FOR SELECT USING (auth.uid() = id);

-- Profiles: allow admins full access (replace with your admin check if different)
CREATE POLICY "Profiles: admins full access" ON public.profiles
   FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Patients: parents can read their children
CREATE POLICY "Patients: parent access" ON public.patients
   FOR SELECT USING (parent_id = auth.uid());

-- Patients: healthcare workers and admins can read patients
CREATE POLICY "Patients: staff access" ON public.patients
   FOR SELECT USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('healthcare_worker', 'admin')
   );

-- Patients: allow staff to insert/update (record created_by) and parents to insert if parent_id = auth.uid()
CREATE POLICY "Patients: insert by staff or parent" ON public.patients
   FOR INSERT WITH CHECK (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('healthcare_worker', 'admin')
      OR parent_id = auth.uid()
   );

-- Vaccinations: allow staff to manage vaccination records for patients they can access
CREATE POLICY "Vaccinations: staff access" ON public.vaccinations
   FOR ALL USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('healthcare_worker', 'admin')
      OR EXISTS (
         SELECT 1 FROM public.patients p WHERE p.id = public.vaccinations.patient_id AND p.parent_id = auth.uid()
      )
   );
```

Notes:
- These examples use `auth.uid()` (Supabase Postgres function) and simple subqueries for role checks. For production, consider implementing helper functions or more explicit role management to simplify policies.
- Test policies with Supabase Studio and a staging project before deploying to production.
- Adjust policies to your exact trust model (e.g., restrict which staff can see which patients, allow read-only for parents, etc.).


## 🔒 Security Features

- **Role-based access control** (Admin, Healthcare Worker, Parent)
- **Secure authentication** with password validation
- **Route protection** with automatic redirection
- **Data isolation** between user roles
- **Admin approval** for healthcare worker accounts with confirmation dialogs
- **Session management** with secure sign-out confirmation

## 🎨 User Interface Features

### Modal System
- **Professional Dialogs**: Custom modal components replace browser alerts
- **Confirmation Modals**: User-friendly confirmation for critical actions
- **Alert Modals**: Success, error, warning, and info notifications
- **Accessibility**: Keyboard navigation and screen reader support
- **Responsive**: Works perfectly on all screen sizes

### Design System
- **Consistent Styling**: Unified design language throughout the app
- **Color-Coded Actions**: Different colors for different types of actions
- **Smooth Animations**: Polished transitions and micro-interactions
- **Mobile-First**: Responsive design optimized for all devices

## 🎨 Screenshots

### Login Screen
![Login](https://via.placeholder.com/600x400/F3F4F6/374151?text=Login+Screen)

### Dashboard
![Dashboard](https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Dashboard+View)

### Patient Management
![Patients](https://via.placeholder.com/600x400/10B981/FFFFFF?text=Patient+Management)

### Admin Panel
![Admin](https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Admin+Panel)

### Modal Dialogs
![Modals](https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=Modal+System)

## 🚧 Recent Updates & Improvements

### ✅ **Latest Features (v1.1.0)**
- **Enhanced Modal System**: Replaced all browser alerts with professional modal dialogs
- **Improved Route Protection**: Automatic redirection based on user roles
- **Better User Feedback**: Success and error notifications via modals
- **Confirmation Dialogs**: User-friendly confirmations for critical actions
- **Fixed Authentication**: Resolved login issues with approved accounts
- **Enhanced Security**: Better role-based access control

### 🐛 **Bug Fixes**
- Fixed login issues with approved healthcare worker accounts
- Resolved route access problems for different user roles
- Improved error handling throughout the application
- Enhanced user session management

## 🔮 Future Enhancements

### Planned Features
- **Database Integration**: PostgreSQL/MySQL support
- **Real-time Sync**: Multi-user real-time updates
- **Mobile App**: Native iOS/Android applications
- **SMS Notifications**: Text message reminders
- **Barcode Scanning**: Vaccine inventory management
- **Multi-language Support**: Localization options
- **API Integration**: Connect with external health systems

### Technical Improvements
- **Progressive Web App** (PWA) capabilities
- **Offline functionality** with service workers
- **Advanced reporting** with more chart types
- **Bulk import/export** functionality
- **Audit logging** for compliance
- **Email notifications** for important events

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed
- Use the existing modal system for user feedback

### Areas for Contribution
- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage improvements
- 🌍 Internationalization
- ♿ Accessibility improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❗ License and copyright notice required

## 📞 Support & Contact

### Getting Help
- **Documentation**: This comprehensive README
- **Issues**: [GitHub Issues](https://github.com/yourusername/child-immunisation-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/child-immunisation-system/discussions)

### Contact Information
- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **Organization**: [Your Organization]
- **Website**: [Your Website]

### Reporting Issues
When reporting issues, please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- User role when the issue occurred

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icons
- **Healthcare Community** for inspiration and requirements
- **Open Source Contributors** who make projects like this possible

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/child-immunisation-system?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/child-immunisation-system?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/child-immunisation-system)
![GitHub license](https://img.shields.io/github/license/yourusername/child-immunisation-system)

---

**Child Immunisation Record System (CIRS)** - *Protecting children's health through better vaccination tracking.* 🏥💉👶

Made with ❤️ for healthcare professionals and families worldwide.

**Version 1.1.0** - Now with enhanced modal system and improved user experience!