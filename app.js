const { createApp } = Vue;

createApp({
  data() {
    return {
      apiUrl: 'https://cw1-api.onrender.com',
      lessons: [],
      sortBy: 'topic',
      ascending: true,
      cart: [],
      currentPage: 'lessons',
      custName: '',
      custPhone: '',
      orderMsg: '',
    };
  },
  computed: {
    validForm() {
      return /^[A-Za-z\s]+$/.test(this.custName) &&   // letters only
        /^[0-9]+$/.test(this.custPhone);         // digits only
    }
  },
  methods: {
    setSort(field) {
      this.sortBy = field;
    },
    sortedLessons() {
      return [...this.lessons].sort((a, b) => {
        let x = a[this.sortBy];
        let y = b[this.sortBy];
        if (typeof x === 'string') { x = x.toLowerCase(); y = y.toLowerCase(); }
        if (this.ascending) return x > y ? 1 : -1;
        return x < y ? 1 : -1;
      });
    },
    addToCart(lesson) {
      if (lesson.space <= 0) return;
      lesson.space--;
      this.cart.push({ ...lesson });
    },

    switchPage(page) {
      this.currentPage = page;
    },

    removeFromCart(index, lesson) {
      // 1. put space back in the master list
      const original = this.lessons.find(l => l._id === lesson._id);
      if (original) { original.space++; }
      // 2. remove from cart
      this.cart.splice(index, 1);
    },

    async checkout() {
      if (!this.validForm) return;
      const order = {
        name: this.custName,
        phone: this.custPhone,
        lessonIDs: this.cart.map(i => i._id),
        space: this.cart.length
      };
      await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      this.orderMsg = 'Order submitted, thank you! Returning to Store page...';
      setTimeout(() => {
        this.orderMsg = '';
        this.$nextTick(() => { this.currentPage = 'lessons'; });
      }, 3500);
      // reset
      this.cart = [];
      this.custName = '';
      this.custPhone = '';
    }
  },

  async mounted() {
    const res = await fetch(`${this.apiUrl}/lessons`);
    this.lessons = await res.json();
  }
}).mount('#app');