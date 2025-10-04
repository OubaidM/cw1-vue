const { createApp } = Vue;

createApp({
  data() {
    return {
      apiUrl: 'https://cw1-api.onrender.com',
      lessons: []
    };
  },
  async mounted() {
    const res = await fetch(`${this.apiUrl}/lessons`);
    this.lessons = await res.json();
  }
}).mount('#app');