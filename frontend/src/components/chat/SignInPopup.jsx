import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const SignInPopup = ({ isOpen, onClose, onContinueWithoutSignIn }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Doord!</h2>
          <p className="text-gray-600">Sign in to save your preferences and book services easily</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => {
              navigate('/homeowners/auth');
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            Sign In
          </Button>
          
          <Button
            onClick={() => {
              navigate('/homeowners/auth');
              onClose();
            }}
            variant="outline"
            className="w-full py-3"
          >
            Create Account
          </Button>
          
          <Button
            onClick={() => {
              onContinueWithoutSignIn();
              onClose();
            }}
            variant="ghost"
            className="w-full py-3 text-gray-600"
          >
            Continue without sign in
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          You'll need to sign in when booking a service
        </p>
      </div>
    </div>
  );
};

export default SignInPopup;