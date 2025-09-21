# The AI Readiness Assessor

**Live Application:** [https://kirbah.github.io/ai-readiness-assessor/](https://kirbah.github.io/ai-readiness-assessor/)

[![CI/CD Status](https://github.com/kirbah/ai-readiness-assessor/actions/workflows/deploy.yml/badge.svg)](https://github.com/kirbah/ai-readiness-assessor/actions)
[![codecov](https://codecov.io/gh/kirbah/ai-readiness-assessor/graph/badge.svg?token=9D6LTCIJ4Z)](https://codecov.io/gh/kirbah/ai-readiness-assessor)

---

### **The Problem**

Most AI projects fail not because of the technology, but because of the gap between a C-suite goal and the on-the-ground reality of the teams, data, and systems expected to deliver it. Technology leaders need a way to quickly diagnose hidden risks before they become multi-million-dollar failures.

### **The Solution**

This application is a free, interactive diagnostic tool for CTOs, VPs of Engineering, and other technology leaders. It's designed to provide an immediate, data-driven snapshot of an organization's readiness to adopt enterprise AI.

The purpose of this tool is to:

- **Provide Immediate Clarity:** Offer tangible, personalized feedback on an organization's strengths and critical gaps.
- **De-Risk Decision Making:** Help leaders identify unseen risks in their data, strategy, and team readiness.
- **Serve as a Bridge to Strategy:** Act as the starting point for a deeper, strategic conversation about turning AI ambition into an executable, low-risk reality.

### **Key Features for Leaders**

- **Strategic Self-Assessment:** A curated questionnaire that evaluates the core pillars of enterprise AI readiness.
- **Instantaneous, Shareable Reports:** Receive a detailed report with a readiness score, a strategic tier, and color-coded insights that can be shared with team members.
- **Data-Driven Conversation Starter:** The results page generates a unique URL, enabling a highly focused follow-up discussion based on concrete data.

### **Technology**

This is a modern, reliable, and secure client-side application built with **React** and **Bootstrap 5**, deployed via GitHub Actions.

### **Privacy and Analytics**

This project uses Google Analytics 4 (GA4) to collect anonymous usage data for improving the AI Readiness Assessor tool. No personal information is collected or stored.

#### **What We Track (Post-Consent Only)**

- **Page Views**: Anonymous navigation to questions and results (e.g., how many complete the assessment).
- **Key Interactions** (aggregate events):
  - Clicks on "Restart Assessment"
  - Clicks to copy shareable results URLs (no URL content stored)
  - Clicks on "Book Consultation Call" (segmented by assessment tier for optimization)

#### **Privacy Details**

- **Consent Required**: A cookie consent banner appears on first visit. Analytics only activate after you accept.
- **No Sensitive Data**: Assessment answers, scores, or shareable URLs are not sent to GA. Only anonymized click facts and tiers (e.g., "Well-Positioned") for aggregate insights.
- **Data Control**: Decline consent to disable all tracking. GA4 anonymizes IPs and retains data for 2 months (configurable).
- **Policy**: For full details, see Google's [Analytics Privacy](https://support.google.com/analytics/answer/6004245).

We respect your privacy and use this data solely to enhance the tool's usability and measure engagement.

---

**Developed by Kiryl Bahdanau**

- **LinkedIn:** [linkedin.com/in/kiryl-bahdanau/](https://www.linkedin.com/in/kiryl-bahdanau/)
