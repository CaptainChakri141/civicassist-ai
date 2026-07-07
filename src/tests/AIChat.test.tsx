import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';


import { AIChat } from '../components/AIChat';

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

describe('AIChat Component', () => {
  it('should render welcome message and prompt suggestions on mount', () => {
    render(<AIChat language="en" />);
    
    // Check for greeting message
    expect(screen.getByText('AI Civic Companion', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText(/Ask me any questions/i)).toBeInTheDocument();
    
    // Check for suggestion chips
    expect(screen.getByText('Am I eligible for CivicCare?')).toBeInTheDocument();
    expect(screen.getByText('What is the CivicHealth income limit?')).toBeInTheDocument();
  });

  it('should allow user to type in chat input and submit', async () => {
    render(<AIChat language="en" />);
    
    const input = screen.getByPlaceholderText(/Ask about eligibility/i);
    const sendButton = screen.getByLabelText('Send message');
    
    fireEvent.change(input, { target: { value: 'How do I renew my driver license?' } });
    expect(input).toHaveValue('How do I renew my driver license?');
    
    fireEvent.click(sendButton);
    
    // Expect loading spinner
    expect(screen.getByRole('search')).toBeInTheDocument();
    
    // Wait for AI response to resolve and render
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Digital Transit/i })).toBeInTheDocument();
    });
  });

  it('should trigger AI response when clicking suggestion chip', async () => {
    render(<AIChat language="en" />);
    
    const suggestionBtn = screen.getByText('Am I eligible for CivicCare?');
    fireEvent.click(suggestionBtn);
    
    // Suggestion chips should disappear
    expect(screen.queryByText('Quick Suggestions')).not.toBeInTheDocument();
    
    // Wait for AI response matching query
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Universal Welfare Support/i })).toBeInTheDocument();
    });
  });
});
