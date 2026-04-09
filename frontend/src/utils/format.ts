export const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return dateString;
    }
};

export const formatTime = (timeString: string | undefined | null) => {
    if (!timeString) return 'N/A';
    // If it's already a simple HH:mm or HH:mm:ss, just return first 5 chars
    if (timeString.includes(':')) {
        return timeString.substring(0, 5);
    }
    return timeString;
};

export const formatDisplayName = (name: string | undefined | null, email: string | undefined | null) => {
    if (name && !name.includes('@')) return name;
    if (email) {
        const prefix = email.split('@')[0];
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'Patient';
};

export const getPasswordStrength = (password: string) => {
    if (!password) return { label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', color: '#f87171' };
    if (score === 2) return { label: 'Medium', color: '#fbbf24' };
    if (score === 3) return { label: 'Strong', color: '#2db87a' };
    return { label: 'Very Strong', color: '#2db87a' };
};
