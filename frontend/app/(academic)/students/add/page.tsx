'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserPlus, Save, X, Upload, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface StudentFormData {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  stateOfOrigin: string;
  lga: string;
  bloodGroup: string;

  // Contact Information
  email: string;
  phone: string;
  alternativePhone: string;
  address: string;
  city: string;
  postalCode: string;

  // Guardian Information
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianAddress: string;

  // Academic Information
  admissionType: string;
  studentType: string;
  program: string;
  department: string;
  faculty: string;
  level: string;
  semester: string;
  academicYear: string;
  admissionDate: string;
  studentId: string;

  // Previous Education
  previousSchool: string;
  previousQualification: string;
  graduationYear: string;
  gradeObtained: string;

  // Documents
  passport: File | null;
  birthCertificate: File | null;
  credentials: File | null;
}

const GENDERS = ['Male', 'Female'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ADMISSION_TYPES = ['Direct Entry', 'JAMB/UTME', 'Transfer', 'Postgraduate'];
const STUDENT_TYPES = ['Full-Time', 'Part-Time', 'Distance Learning', 'Weekend'];
const LEVELS = ['100', '200', '300', '400', '500', '600', '700'];
const SEMESTERS = ['First Semester', 'Second Semester'];
const RELATIONSHIPS = ['Father', 'Mother', 'Guardian', 'Uncle', 'Aunt', 'Sibling', 'Spouse', 'Other'];

const FACULTIES = [
  'Faculty of Science',
  'Faculty of Engineering',
  'Faculty of Arts',
  'Faculty of Social Sciences',
  'Faculty of Medicine',
  'Faculty of Business Administration',
];

const DEPARTMENTS: Record<string, string[]> = {
  'Faculty of Science': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Microbiology'],
  'Faculty of Engineering': ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Computer Engineering'],
  'Faculty of Arts': ['English', 'History', 'Philosophy', 'Languages'],
  'Faculty of Social Sciences': ['Economics', 'Sociology', 'Political Science', 'Psychology'],
  'Faculty of Medicine': ['Medicine', 'Nursing', 'Pharmacy', 'Medical Laboratory Science'],
  'Faculty of Business Administration': ['Business Administration', 'Accounting', 'Marketing', 'Banking & Finance'],
};

const PROGRAMS: Record<string, string[]> = {
  'Computer Science': ['BSc Computer Science', 'MSc Computer Science', 'PhD Computer Science'],
  'Mathematics': ['BSc Mathematics', 'MSc Mathematics'],
  'Nursing': ['BSc Nursing', 'MSc Nursing'],
  'Business Administration': ['BBA', 'MBA', 'PhD Business Administration'],
  // Add more as needed
};

export default function AddStudentPage() {
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Sierra Leone',
    stateOfOrigin: '',
    lga: '',
    bloodGroup: '',
    email: '',
    phone: '',
    alternativePhone: '',
    address: '',
    city: '',
    postalCode: '',
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
    admissionType: '',
    studentType: '',
    program: '',
    department: '',
    faculty: '',
    level: '',
    semester: '',
    academicYear: '2024-2025',
    admissionDate: '',
    studentId: '',
    previousSchool: '',
    previousQualification: '',
    graduationYear: '',
    gradeObtained: '',
    passport: null,
    birthCertificate: null,
    credentials: null,
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'guardian' | 'academic' | 'previous' | 'documents'>('personal');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof StudentFormData) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.program) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Student added successfully!');
    // Reset form
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      nationality: 'Sierra Leone',
      stateOfOrigin: '',
      lga: '',
      bloodGroup: '',
      email: '',
      phone: '',
      alternativePhone: '',
      address: '',
      city: '',
      postalCode: '',
      guardianName: '',
      guardianRelationship: '',
      guardianPhone: '',
      guardianEmail: '',
      guardianAddress: '',
      admissionType: '',
      studentType: '',
      program: '',
      department: '',
      faculty: '',
      level: '',
      semester: '',
      academicYear: '2024-2025',
      admissionDate: '',
      studentId: '',
      previousSchool: '',
      previousQualification: '',
      graduationYear: '',
      gradeObtained: '',
      passport: null,
      birthCertificate: null,
      credentials: null,
    });
  };

  const currentDepartments = formData.faculty ? DEPARTMENTS[formData.faculty] || [] : [];
  const currentPrograms = formData.department ? PROGRAMS[formData.department] || [] : [];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-black">ADD NEW STUDENT</h1>
          </div>
          <p className="text-black">Register new students with complete information and documentation</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[
              { key: 'personal', label: 'Personal Info' },
              { key: 'contact', label: 'Contact Info' },
              { key: 'guardian', label: 'Guardian Info' },
              { key: 'academic', label: 'Academic Info' },
              { key: 'previous', label: 'Previous Education' },
              { key: 'documents', label: 'Documents' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-black hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            {/* Personal Information */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter middle name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Gender</option>
                      {GENDERS.map((gender) => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Blood Group</option>
                      {BLOOD_GROUPS.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter nationality"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">State of Origin</label>
                    <input
                      type="text"
                      name="stateOfOrigin"
                      value={formData.stateOfOrigin}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">LGA/District</label>
                    <input
                      type="text"
                      name="lga"
                      value={formData.lga}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter LGA/District"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="student@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="+232 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Alternative Phone</label>
                    <input
                      type="tel"
                      name="alternativePhone"
                      value={formData.alternativePhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="+232 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Residential Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Guardian Information */}
            {activeTab === 'guardian' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black mb-4">Guardian/Next of Kin Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Guardian Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="guardianName"
                      value={formData.guardianName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter guardian name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="guardianRelationship"
                      value={formData.guardianRelationship}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Relationship</option>
                      {RELATIONSHIPS.map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Guardian Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="+232 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Guardian Email</label>
                    <input
                      type="email"
                      name="guardianEmail"
                      value={formData.guardianEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="guardian@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">Guardian Address</label>
                    <textarea
                      name="guardianAddress"
                      value={formData.guardianAddress}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter guardian address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Information */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black mb-4">Academic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Student ID</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Admission Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="admissionType"
                      value={formData.admissionType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Type</option>
                      {ADMISSION_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Student Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="studentType"
                      value={formData.studentType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Type</option>
                      {STUDENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Faculty <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Faculty</option>
                      {FACULTIES.map((faculty) => (
                        <option key={faculty} value={faculty}>{faculty}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      disabled={!formData.faculty}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                    >
                      <option value="">Select Department</option>
                      {currentDepartments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Program <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      required
                      disabled={!formData.department}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                    >
                      <option value="">Select Program</option>
                      {currentPrograms.map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Level</option>
                      {LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Semester</option>
                      {SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Academic Year</label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="2024-2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Admission Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Previous Education */}
            {activeTab === 'previous' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black mb-4">Previous Education</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Previous School/Institution</label>
                    <input
                      type="text"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter school name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Qualification Obtained</label>
                    <input
                      type="text"
                      name="previousQualification"
                      value={formData.previousQualification}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., WASSCE, A-Levels"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Graduation Year</label>
                    <input
                      type="text"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="2023"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Grade/Score Obtained</label>
                    <input
                      type="text"
                      name="gradeObtained"
                      value={formData.gradeObtained}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., Distinction, 3.5 GPA"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black mb-4">Document Upload</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-500 transition">
                    <label className="block text-sm font-medium text-black mb-2">
                      Passport Photograph <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'passport')}
                        className="hidden"
                        id="passport"
                      />
                      <label
                        htmlFor="passport"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                      <span className="text-sm text-black">
                        {formData.passport ? formData.passport.name : 'No file chosen'}
                      </span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-500 transition">
                    <label className="block text-sm font-medium text-black mb-2">Birth Certificate</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'birthCertificate')}
                        className="hidden"
                        id="birthCert"
                      />
                      <label
                        htmlFor="birthCert"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                      <span className="text-sm text-black">
                        {formData.birthCertificate ? formData.birthCertificate.name : 'No file chosen'}
                      </span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-500 transition">
                    <label className="block text-sm font-medium text-black mb-2">Academic Credentials</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'credentials')}
                        className="hidden"
                        id="credentials"
                      />
                      <label
                        htmlFor="credentials"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                      <span className="text-sm text-black">
                        {formData.credentials ? formData.credentials.name : 'No file chosen'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Student
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
