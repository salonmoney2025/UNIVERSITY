'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Key,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Very Weak',
    color: 'bg-red-500',
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false
    }
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let label = 'Very Weak';
    let color = 'bg-red-500';

    if (score === 5) {
      label = 'Very Strong';
      color = 'bg-green-500';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-green-400';
    } else if (score === 3) {
      label = 'Medium';
      color = 'bg-yellow-500';
    } else if (score === 2) {
      label = 'Weak';
      color = 'bg-orange-500';
    }

    return { score, label, color, requirements };
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!currentPassword) {
        toast.error('Please enter your current password');
        setIsSubmitting(false);
        return;
      }

      if (!newPassword) {
        toast.error('Please enter a new password');
        setIsSubmitting(false);
        return;
      }

      if (newPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        setIsSubmitting(false);
        return;
      }

      if (newPassword === currentPassword) {
        toast.error('New password must be different from current password');
        setIsSubmitting(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        setIsSubmitting(false);
        return;
      }

      // Check password strength
      if (passwordStrength.score < 3) {
        toast.error('Password is too weak. Please choose a stronger password.');
        setIsSubmitting(false);
        return;
      }

      // Send to API
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Password changed successfully!');

          // Clear form
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordStrength({
            score: 0,
            label: 'Very Weak',
            color: 'bg-red-500',
            requirements: {
              minLength: false,
              hasUpperCase: false,
              hasLowerCase: false,
              hasNumber: false,
              hasSpecialChar: false
            }
          });

          // Optionally redirect
          setTimeout(() => {
            router.push('/settings');
          }, 2000);
        } else {
          toast.error(data.message || 'Failed to change password');
        }
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('An error occurred while changing password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requirementItems = [
    {
      label: 'At least 8 characters',
      met: passwordStrength.requirements.minLength,
      icon: passwordStrength.requirements.minLength ? CheckCircle : XCircle,
      color: passwordStrength.requirements.minLength ? 'text-green-600' : 'text-black'
    },
    {
      label: 'One uppercase letter (A-Z)',
      met: passwordStrength.requirements.hasUpperCase,
      icon: passwordStrength.requirements.hasUpperCase ? CheckCircle : XCircle,
      color: passwordStrength.requirements.hasUpperCase ? 'text-green-600' : 'text-black'
    },
    {
      label: 'One lowercase letter (a-z)',
      met: passwordStrength.requirements.hasLowerCase,
      icon: passwordStrength.requirements.hasLowerCase ? CheckCircle : XCircle,
      color: passwordStrength.requirements.hasLowerCase ? 'text-green-600' : 'text-black'
    },
    {
      label: 'One number (0-9)',
      met: passwordStrength.requirements.hasNumber,
      icon: passwordStrength.requirements.hasNumber ? CheckCircle : XCircle,
      color: passwordStrength.requirements.hasNumber ? 'text-green-600' : 'text-black'
    },
    {
      label: 'One special character (!@#$%^&*)',
      met: passwordStrength.requirements.hasSpecialChar,
      icon: passwordStrength.requirements.hasSpecialChar ? CheckCircle : XCircle,
      color: passwordStrength.requirements.hasSpecialChar ? 'text-green-600' : 'text-black'
    }
  ];

  return (
    <div className="min-h-screen bg-solid black-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/settings" className="inline-flex items-center text-portal-teal-600 hover:text-portal-teal-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Link>

        <div className="flex items-center space-x-3">
          <Lock className="w-8 h-8 text-portal-teal-600" />
          <div>
            <h1 className="text-3xl font-bold text-black">Change Password</h1>
            <p className="text-black">Update your password to keep your account secure</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent pr-12"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-black"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    required
                    className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent pr-12"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-black"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-black">Password Strength:</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.score === 5 ? 'text-green-600' :
                        passwordStrength.score === 4 ? 'text-green-500' :
                        passwordStrength.score === 3 ? 'text-yellow-500' :
                        passwordStrength.score === 2 ? 'text-orange-500' :
                        'text-red-500'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-solid black-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent pr-12"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-black"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2 flex items-center">
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-portal-teal-600 text-white rounded-lg hover:bg-portal-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Changing Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Requirements & Tips */}
        <div className="lg:col-span-1 space-y-6">
          {/* Password Requirements */}
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-6 h-6 text-portal-teal-600" />
              <h3 className="font-bold text-black">Password Requirements</h3>
            </div>

            <div className="space-y-3">
              {requirementItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
                  <span className={`text-sm ${item.met ? 'text-black' : 'text-black'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50 rounded-lg border-l-4 border-blue-500 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Security Tips</h3>
            </div>

            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Use a unique password for this account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Don't share your password with anyone</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Change your password regularly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Avoid using common words or personal information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Consider using a password manager</span>
              </li>
            </ul>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 rounded-lg border-l-4 border-yellow-500 p-6">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-yellow-900">Important</h3>
            </div>
            <p className="text-sm text-yellow-800">
              After changing your password, you'll remain logged in on this device.
              You'll need to use your new password when logging in from other devices.
            </p>
          </div>

          {/* Forgot Password Link */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-5 h-5 text-black" />
              <h3 className="font-bold text-black">Forgot Password?</h3>
            </div>
            <p className="text-sm text-black mb-3">
              If you can't remember your current password, you can reset it.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center text-sm text-portal-teal-600 hover:text-portal-teal-700 font-medium"
            >
              Reset Password →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
