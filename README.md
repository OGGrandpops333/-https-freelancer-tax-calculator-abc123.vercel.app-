# Freelancer Tax Calculator

A simple web-based tax calculator for freelancers to estimate their federal and self-employment taxes.

## Features

- **Personal Information**: Enter your name for a personalized experience
- **Income Calculation**: Input your annual income and business expenses
- **Tax Estimation**: Calculates federal income tax and self-employment tax
- **State Selection**: Select your state (for future state tax features)
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. Open `index.html` in your web browser
2. Enter your name when prompted "What is your name?"
3. Fill in your annual income and business expenses
4. Select your state
5. Click "Calculate Tax" to see your estimated tax liability

## How It Works

The calculator:
1. Asks for your name to personalize the results
2. Calculates your taxable income (income - expenses)
3. Applies federal tax brackets for 2024 (single filer)
4. Calculates self-employment tax (15.3% of 92.35% of net income)
5. Displays the total estimated tax liability with a personalized greeting

## Files

- `index.html` - Main HTML structure with the form asking "What is your name?"
- `styles.css` - Styling for the calculator
- `script.js` - JavaScript for tax calculations and form handling

## Deployment

This is a static web application that can be deployed to Vercel, GitHub Pages, or any static hosting service.

## Note

This calculator provides estimates only. Consult with a tax professional for accurate tax advice.