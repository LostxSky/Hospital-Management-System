import { useEffect, useRef } from 'react';

/**
 * Custom hook to trigger reveal animations when elements enter the viewport.
 * Adds the 'reveal-visible' class to elements with reveal classes.
 *
 * @param deps - Dependency array to re-initialize the observer (useful for dynamic content)
 */
export const useScrollReveal = (deps: any[] = []) => {
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // Configuration for the Intersection Observer
        const options = {
            root: null, // Viewport
            threshold: 0.1, // Trigger when 10% is visible
            rootMargin: '0px 0px -40px 0px'
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observerRef.current?.unobserve(entry.target);
                }
            });
        }, options);

        // Scan for both reveal and reveal-scale elements
        const elements = document.querySelectorAll('.reveal, .reveal-scale');
        elements.forEach((el) => observerRef.current?.observe(el));

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, deps);
};
