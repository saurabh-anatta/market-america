import { Component } from '@theme/component';

/**
 * @typedef {Object} CustomHeaderRefs
 * @property {HTMLButtonElement} drawerToggle - Hamburger button
 * @property {HTMLButtonElement} drawerClose - Close button in drawer
 * @property {HTMLElement} drawer - Drawer panel
 * @property {HTMLElement} drawerOverlay - Drawer overlay backdrop
 */

/** @extends {Component<CustomHeaderRefs>} */
class CustomHeaderComponent extends Component {
  /** @type {AbortController | null} */
  #abortController = null;

  connectedCallback() {
    super.connectedCallback();
    this.#abortController = new AbortController();
    const signal = this.#abortController.signal;

    this.#updateHeaderHeight();

    window.addEventListener('resize', () => this.#updateHeaderHeight(), { signal });

    if (this.dataset.stickyHeader === 'true') {
      window.addEventListener('scroll', () => this.#handleScroll(), { signal, passive: true });
    }

    this.#initDrawerSubmenus();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.#abortController) {
      this.#abortController.abort();
      this.#abortController = null;
    }
  }

  #updateHeaderHeight() {
    const height = this.offsetHeight;
    document.body.style.setProperty('--header-height', `${height}px`);

    const headerGroup = this.closest('#header-group');

    if (headerGroup) {
      let groupHeight = 0;
      const children = headerGroup.children;

      for (const element of children) {
        if (element instanceof HTMLElement) {
          groupHeight += element.offsetHeight;
        }
      }

      document.body.style.setProperty('--header-group-height', `${groupHeight}px`);
    }
  }

  #handleScroll() {
    if (window.scrollY > 0) {
      this.classList.add('is-sticky');
    } else {
      this.classList.remove('is-sticky');
    }
  }

  /**
   * Opens the drawer panel.
   * @param {Event} event
   */
  handleDrawerOpen(event) {
    event.preventDefault();

    if (!this.refs.drawer || !this.refs.drawerOverlay) return;

    this.refs.drawer.classList.add('is-open');
    this.refs.drawerOverlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    this.setAttribute('drawer-open', '');

    if (this.refs.drawerClose) {
      this.refs.drawerClose.focus();
    }
  }

  /**
   * Closes the drawer panel.
   * @param {Event} event
   */
  handleDrawerClose(event) {
    event.preventDefault();
    this.#closeDrawer();
  }

  /**
   * Closes drawer when clicking the overlay.
   * @param {Event} event
   */
  handleOverlayClick(event) {
    event.preventDefault();
    this.#closeDrawer();
  }

  #closeDrawer() {
    if (!this.refs.drawer || !this.refs.drawerOverlay) return;

    this.refs.drawer.classList.remove('is-open');
    this.refs.drawerOverlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    this.removeAttribute('drawer-open');

    if (this.refs.drawerToggle) {
      this.refs.drawerToggle.focus();
    }
  }

  /**
   * Opens the search modal reusing the existing dialog.
   * @param {Event} event
   */
  handleSearchClick(event) {
    event.preventDefault();
    const searchModal = document.querySelector('#search-modal');

    if (searchModal && typeof searchModal.showDialog === 'function') {
      searchModal.showDialog();
    }
  }

  #initDrawerSubmenus() {
    const submenuToggles = this.querySelectorAll('[data-submenu-toggle]');

    for (const toggle of submenuToggles) {
      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        const parent = toggle.closest('.custom-header-drawer__item--has-children');

        if (!parent) return;

        const submenu = parent.querySelector('.custom-header-drawer__submenu');

        if (!submenu) return;

        const isOpen = parent.classList.contains('is-open');
        parent.classList.toggle('is-open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
      });
    }
  }
}

customElements.define('custom-header-component', CustomHeaderComponent);
