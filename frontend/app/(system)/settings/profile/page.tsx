'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Briefcase,
  Camera,
  Save,
  X,
  Edit,
  Upload,
  UserCircle,
  Info,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface ProfileData {
  // Personal Information
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;

  // Contact Information
  email: string;
  phoneNumber: string;
  alternatePhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  // Professional Information
  department: string;
  position: string;
  employeeId: string;
  dateJoined: string;
  campus: string;
  faculty: string;

  // Additional
  bio: string;
  profilePhoto: string;
}

export default function ProfileSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'emergency' | 'professional' | 'additional'>('personal');
  const [profilePhoto, setProfilePhoto] = useState<string>('/placeholder-avatar.png');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<ProfileData>({
    title: 'Mr.',
    firstName: 'John',
    middleName: 'Samuel',
    lastName: 'Doe',
    gender: 'Male',
    dateOfBirth: '1990-05-15',
    nationality: 'Sierra Leonean',
    idNumber: 'SL123456789',

    email: 'john.doe@ebkustsl.edu.sl',
    phoneNumber: '+232 76 123 456',
    alternatePhone: '+232 78 987 654',
    address: '123 Main Street, Tower Hill',
    city: 'Freetown',
    state: 'Western Area',
    country: 'Sierra Leone',
    postalCode: '00000',

    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+232 77 555 123',
    emergencyContactRelationship: 'Spouse',

    department: 'Computer Science',
    position: 'Senior Lecturer',
    employeeId: 'EMP-2024-001',
    dateJoined: '2020-09-01',
    campus: 'Main Campus - Makeni',
    faculty: 'Faculty of Engineering',

    bio: 'Experienced educator with a passion for technology and innovation.',
    profilePhoto: ''
  });

  const [originalData, setOriginalData] = useState<ProfileData>(formData);

  useEffect(() => {
    // Fetch user profile data
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/settings/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFormData(data.profile);
          setOriginalData(data.profile);
          if (data.profile.profilePhoto) {
            setProfilePhoto(data.profile.profilePhoto);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setPhotoFile(file);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast.success('Photo selected. Click Save to update.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error('Please fill in all required fields');
        setIsSaving(false);
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append all profile data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append photo if changed
      if (photoFile) {
        formDataToSend.append('profilePhoto', photoFile);
      }

      // Send to API
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Profile updated successfully!');
          setOriginalData(formData);
          setIsEditing(false);
          setPhotoFile(null);
        } else {
          toast.error(data.message || 'Failed to update profile');
        }
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setProfilePhoto(originalData.profilePhoto || '/placeholder-avatar.png');
    setPhotoFile(null);
    setIsEditing(false);
    toast('Changes discarded');
  };

  const tabs = [
    { id: 'personal' as const, label: 'Personal Information', icon: User },
    { id: 'contact' as const, label: 'Contact Details', icon: Phone },
    { id: 'emergency' as const, label: 'Emergency Contact', icon: AlertCircle },
    { id: 'professional' as const, label: 'Professional Info', icon: Briefcase },
    { id: 'additional' as const, label: 'Additional', icon: Info }
  ];

  return (
    <div className="min-h-screen bg-solid black-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/settings" className="inline-flex items-center text-portal-teal-600 hover:text-portal-teal-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserCircle className="w-8 h-8 text-portal-teal-600" />
            <div>
              <h1 className="text-3xl font-bold text-black">Profile Settings</h1>
              <p className="text-black">Manage your personal information and contact details</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-portal-teal-600 text-white rounded-lg hover:bg-portal-teal-700 transition-colors"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-3 bg-solid black-200 text-black rounded-lg hover:bg-solid black-300 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Photo Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="font-bold text-black mb-4">Profile Photo</h3>

            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-portal-teal-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                  }}
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="mt-4 text-center">
                <p className="font-bold text-black">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-black">{formData.position}</p>
                <p className="text-xs text-black mt-1">{formData.employeeId}</p>
              </div>

              {isEditing && (
                <div className="mt-4 text-center">
                  <label className="inline-flex items-center space-x-2 px-4 py-2 bg-portal-teal-50 text-portal-teal-600 rounded-lg cursor-pointer hover:bg-portal-teal-100 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-black mt-2">Max size: 5MB</p>
                  <p className="text-xs text-black">JPG, PNG, or GIF</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-solid black-200 bg-solid black-50">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-portal-teal-600 border-b-2 border-portal-teal-600 bg-white'
                        : 'text-black hover:text-black'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-black mb-4">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
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
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        ID Number
                      </label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Details Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-black mb-4">Contact Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="+232 XX XXX XXX"
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Alternate Phone
                      </label>
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="+232 XX XXX XXX"
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact Tab */}
              {activeTab === 'emergency' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-black mb-4">Emergency Contact</h3>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        This information will be used to contact someone on your behalf in case of an emergency.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="+232 XX XXX XXX"
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Relationship <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="emergencyContactRelationship"
                        value={formData.emergencyContactRelationship}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                      >
                        <option value="">Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information Tab */}
              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-black mb-4">Professional Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        disabled
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Position/Title
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        disabled
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        disabled
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Faculty
                      </label>
                      <input
                        type="text"
                        name="faculty"
                        value={formData.faculty}
                        disabled
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Campus
                      </label>
                      <input
                        type="text"
                        name="campus"
                        value={formData.campus}
                        disabled
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg bg-solid black-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Date Joined
                      </label>
                      <input
                        type="date"
                        name="dateJoined"
                        value={formData.dateJoined}
                        disabled
                        className="w-full px-4 py-3 border border-solid black-300 rounded-lg bg-solid black-100"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-blue-600 mr-2" />
                      <p className="text-sm text-blue-800">
                        Professional information fields are read-only. Please contact HR to update these details.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information Tab */}
              {activeTab === 'additional' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-black mb-4">Additional Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Bio / About Me
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={6}
                      placeholder="Tell us about yourself, your interests, and professional background..."
                      className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent disabled:bg-solid black-100"
                    />
                    <p className="text-sm text-black mt-2">
                      {formData.bio.length} / 500 characters
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
