import { describe, it, expect } from 'vitest';
import { generateAIResponse, autoCategorizeIssue, simplifyPolicyText } from '../utils/aiEngine';

describe('Local Simulated GenAI Engine', () => {
  describe('generateAIResponse', () => {
    it('should match welfare queries with CivicCare information', async () => {
      const res = await generateAIResponse('I need financial assistance and welfare support', 'en');
      expect(res.source).toBe('local');
      expect(res.text).toContain('CivicCare');
      expect(res.text).toContain('income must be under');
      expect(res.data?.serviceId).toBe('civic-care');
    });

    it('should match health insurance queries with CivicHealth information', async () => {
      const res = await generateAIResponse('health insurance for senior citizens', 'en');
      expect(res.source).toBe('local');
      expect(res.text).toContain('CivicHealth');
      expect(res.data?.serviceId).toBe('civic-health');
    });

    it('should translate output responses based on selected language', async () => {
      const resSpanish = await generateAIResponse('welfare support info', 'es');
      expect(resSpanish.text).toContain('Apoyo de Bienestar');
      expect(resSpanish.text).toContain('Edad:');
      
      const resFrench = await generateAIResponse('welfare support info', 'fr');
      expect(resFrench.text).toContain('Aide Sociale');
      expect(resFrench.text).toContain('Âge:');
    });
  });

  describe('autoCategorizeIssue', () => {
    it('should assign pothole reports to Roads & Sidewalks', async () => {
      const res = await autoCategorizeIssue('Deep pothole blocking traffic on Elm street', 'Elm St');
      expect(res.category).toBe('Roads & Sidewalks');
      expect(res.assignedDepartment).toContain('Bureau of Highways');
      expect(res.priority).toBe('High');
    });

    it('should assign sewage or leak reports to Water & Utilities', async () => {
      const res = await autoCategorizeIssue('There is a burst water pipe flooding the sidewalk', 'Main St');
      expect(res.category).toBe('Water & Utilities');
      expect(res.priority).toBe('High');
    });

    it('should assign trash reports to Sanitation & Waste', async () => {
      const res = await autoCategorizeIssue('Illegal dumping of plastic garbage bags', 'Oak Lane');
      expect(res.category).toBe('Sanitation & Waste');
      expect(res.priority).toBe('Medium');
    });
  });

  describe('simplifyPolicyText', () => {
    it('should simplify legal text and return summary, action points, and deadlines', async () => {
      const complexText = 'Pursuant to Municipal Code Section 12-4B, photovoltaic converters must submit capacity metrics within 30 days of execution...';
      const res = await simplifyPolicyText(complexText);
      expect(res.summary).toBeDefined();
      expect(res.actionItems.length).toBeGreaterThan(0);
      expect(res.deadlines.length).toBeGreaterThan(0);
      expect(res.checklist.length).toBeGreaterThan(0);
    });
  });
});
