document.getElementById('taxForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const income = parseFloat(document.getElementById('income').value) || 0;
    const expenses = parseFloat(document.getElementById('expenses').value) || 0;
    const state = document.getElementById('state').value;
    
    // Calculate taxable income
    const taxableIncome = Math.max(0, income - expenses);
    
    // Calculate self-employment tax (15.3% of 92.35% of net income)
    const selfEmploymentTax = taxableIncome * 0.9235 * 0.153;
    
    // Simple federal tax brackets (2024 estimates for single filer)
    let federalTax = 0;
    if (taxableIncome > 0) {
        if (taxableIncome <= 11000) {
            federalTax = taxableIncome * 0.10;
        } else if (taxableIncome <= 44725) {
            federalTax = 1100 + (taxableIncome - 11000) * 0.12;
        } else if (taxableIncome <= 95375) {
            federalTax = 5147 + (taxableIncome - 44725) * 0.22;
        } else if (taxableIncome <= 182100) {
            federalTax = 16290 + (taxableIncome - 95375) * 0.24;
        } else if (taxableIncome <= 231250) {
            federalTax = 37104 + (taxableIncome - 182100) * 0.32;
        } else if (taxableIncome <= 578125) {
            federalTax = 52832 + (taxableIncome - 231250) * 0.35;
        } else {
            federalTax = 174238.25 + (taxableIncome - 578125) * 0.37;
        }
    }
    
    // Calculate total tax
    const totalTax = federalTax + selfEmploymentTax;
    
    // Display results
    document.getElementById('greeting').textContent = `Hello, ${name}! Here are your estimated taxes:`;
    document.getElementById('taxableIncome').textContent = `$${taxableIncome.toFixed(2)}`;
    document.getElementById('federalTax').textContent = `$${federalTax.toFixed(2)}`;
    document.getElementById('selfEmploymentTax').textContent = `$${selfEmploymentTax.toFixed(2)}`;
    document.getElementById('totalTax').textContent = `$${totalTax.toFixed(2)}`;
    
    // Show results
    document.getElementById('results').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
