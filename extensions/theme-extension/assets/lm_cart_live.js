/**
 * LmLiveCart - Live cart monitoring and updates for LM Cart Check
 */
class LmLiveCart {
    constructor() {
        this.cookieMaxAge = 4 * 60 * 60; // 4 hours   
        this.cookieName = 'lm_cart';
        this.shopifyCartCookieName = 'cart';
        this.init();
    }
    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
    setCookie(name, value, maxAgeSeconds) {
        document.cookie = name + "=" + encodeURIComponent(value) + "; path=/; max-age=" + maxAgeSeconds + "; SameSite=Lax";
    }
    observeCartApiCalls(callback) {
        if (typeof PerformanceObserver === 'undefined') return null;
        const observer = new PerformanceObserver(function (entries) {
            const hasCartCall = entries.getEntriesByType('resource').some(
                ({ name }) => /\/cart\/(change|update|add|clear)/i.test(name)
            );
            if (hasCartCall) callback();
        });
        observer.observe({ entryTypes: ['resource'] });
        return observer;
    }
    /** Get cart token from cookie only (no localStorage write) */
    getCartTokenFromCookie() {
        return this.getCookie(this.shopifyCartCookieName);
    }
    getCartToken() {
        const cartTokenKey = this.getCartTokenFromCookie();
        debugger
        if (cartTokenKey) {
            this.setCookie(this.cookieName, cartTokenKey, this.cookieMaxAge); // 4 hours    
            return cartTokenKey;
        }
        return null;
    }
    // init
    init() {
        debugger
        this.onCartApiCall();
        this.observeCartApiCalls(() => this.onCartApiCall());
    }
    checkCartTokenChange() {
        const storedCartToken = this.getCookie(this.cookieName);
        const currentCartToken = this.getCartTokenFromCookie();
        if (currentCartToken !== storedCartToken) {
            if (currentCartToken) this.setCookie(this.cookieName, currentCartToken, this.cookieMaxAge); // 4 hours
            return currentCartToken;
        }
        return null;
    }
    onCartApiCall() {
        const cartToken = this.checkCartTokenChange();
        if (cartToken) {
            console.log('Cart token changed:', cartToken);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
       window.lmLiveCart = new LmLiveCart();
});
