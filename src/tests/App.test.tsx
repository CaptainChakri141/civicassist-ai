import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';


import App from '../App';

// Mock Web Speech APIs to avoid errors in JSDOM environment
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn().mockReturnValue([])
  },
  writable: true
});

Object.defineProperty(window, 'SpeechRecognition', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: vi.fn(),
  writable: true
});

describe('App Component Mounting Test', () => {
  it('should render the header and hero banner successfully', () => {
    render(<App />);
    
    // Check that the header title 'CivicAssist AI' renders
    expect(screen.getByText('CivicAssist AI', { selector: 'h1' })).toBeInTheDocument();
    
    // Check that the banner title renders
    expect(screen.getByText('Official Citizen Services AI Platform')).toBeInTheDocument();
    
    // Check that the chat view renders (as it is the default tab)
    expect(screen.getByText('AI Civic Companion', { selector: 'h2' })).toBeInTheDocument();
  });

  it('should switch tabs successfully when navigation buttons are clicked', () => {
    render(<App />);
    
    // Find the navigation links by role
    const servicesTabButton = screen.getByRole('button', { name: /Services & Eligibility/i });
    const reportTabButton = screen.getByRole('button', { name: /Report Public Issue/i });
    const simplifierTabButton = screen.getByRole('button', { name: /Policy Simplifier/i });

    // Switch to Services tab
    fireEvent.click(servicesTabButton);
    expect(screen.getByPlaceholderText('Search government services...')).toBeInTheDocument();

    // Switch to Report tab
    fireEvent.click(reportTabButton);
    expect(screen.getByText('Report a Public Issue', { selector: 'h2' })).toBeInTheDocument();

    // Switch to Policy tab
    fireEvent.click(simplifierTabButton);
    expect(screen.getByText('Policy Legalese Simplifier', { selector: 'h2' })).toBeInTheDocument();
  });
});

