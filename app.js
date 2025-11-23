const { createApp } = Vue;

createApp({
  data() {
    return {
      apiUrl: 'https://cw1-api.onrender.com',
      lessons: [],
      sortBy: 'topic',
      ascending: true,
      cart: []
    };
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
    // 1. decrease local copy immediately (UX)
    lesson.space--;
    // 2. push into cart
    this.cart.push({ ...lesson });
  }
},

  async mounted() {
    const res = await fetch(`${this.apiUrl}/lessons`);
    this.lessons = await res.json();
  }
}).mount('#app');