// app.js  –  Vue 3  –  after-school lessons front-end
const { createApp } = Vue;

createApp({
  // ===== reactive data =====
  data() {
    return {
      apiUrl: 'https://cw1-api.onrender.com',
      lessons: [],          // full list from API
      sortBy: 'topic',      // default sort key
      ascending: true,      // sort direction
      cart: [],             // shopping cart
      currentPage: 'lessons', // 'lessons' | 'cart'
      custName: '',         // checkout field
      custPhone: '',        // checkout field
      orderMsg: '',         // success text
      searchText: '',       // search box
      searchResults: []     // filtered list from API
    };
  },

  // ===== validators =====
  computed: {
    validForm() {
      return /^[A-Za-z\s]+$/.test(this.custName) &&
             /^[0-9]+$/.test(this.custPhone);
    }
  },

  // ===== utilities =====
  methods: {
    // sort button handler
    setSort(field) { this.sortBy = field; },

    // return lessons array sorted by current key/direction
    sortedLessons() {
      return [...this.lessons].sort((a, b) => {
        let x = a[this.sortBy], y = b[this.sortBy];
        if (typeof x === 'string') { x = x.toLowerCase(); y = y.toLowerCase(); }
        return this.ascending ? (x > y ? 1 : -1) : (x < y ? 1 : -1);
      });
    },

    // add lesson to cart (decrements local space)
    addToCart(lesson) {
      if (lesson.space <= 0) return;
      lesson.space--;
      this.cart.push({ ...lesson });
    },

    // toggle between lessons / cart page
    switchPage(page) { this.currentPage = page; },

    // remove from cart & restore space
    removeFromCart(index, lesson) {
      const original = this.lessons.find(l => l._id === lesson._id);
      if (original) original.space++;
      this.cart.splice(index, 1);
    },

    // checkout: POST order + PUT spaces + clear cart
    async checkout() {
      if (!this.validForm) return;

      // build order payload
      const order = {
        name: this.custName,
        phone: this.custPhone,
        lessonIDs: this.cart.map(i => i._id),
        space: this.cart.length
      };

      // POST order
      await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      // PUT updated spaces for each lesson
      for (const item of this.cart) {
        await fetch(`${this.apiUrl}/lessons/${item._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ space: item.space })
        });
      }

      // user feedback + auto-return
      this.orderMsg = 'Order submitted, thank you! Returning to Store page...';
      setTimeout(() => {
        this.orderMsg = '';
        this.$nextTick(() => { this.currentPage = 'lessons'; });
      }, 3500);

      // reset form & cart
      this.cart = [];
      this.custName = '';
      this.custPhone = '';
    },

    // live search (as-you-type)
    async onSearch() {
      if (!this.searchText) { this.searchResults = []; return; }
      const res = await fetch(`${this.apiUrl}/search?q=${encodeURIComponent(this.searchText)}`);
      this.searchResults = await res.json();
    }
  },

  // ===== initial data load =====
  async mounted() {
    const res = await fetch(`${this.apiUrl}/lessons`);
    this.lessons = await res.json();
  }
}).mount('#app');