import zh from './zh_TW.js';
// 載入的東西要寫，對應import zh的部分
VeeValidate.localize('tw', zh);

// 用全域註冊比較方便 ,也可以使用區域註冊 這是給表單 使用
Vue.component('ValidationProvider', VeeValidate.ValidationProvider);
// 用全域註冊比較方便，也可以使用區域註冊 這是給form 使用
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);
// loading 的外掛
Vue.use(VueLoading);
// 全域註冊
Vue.component('loading', VueLoading)

// 加入千分號
Vue.filter('money', function (num) {
  let parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + parts.join('.');
})

VeeValidate.configure({
  classes: {
    valid: 'is-valid',
    invalid: 'is-invalid',
  }
});

const app = new Vue({
  el: '#app',
  data: {
    // 先宣告會使用到的
    user: {
      uuid: 'b580788b-f288-49ed-91ab-91e9bd538509',
      apiUrl: 'https://course-ec-api.hexschool.io/api',
    },
    form: {
      name: '',
      email: '',
      tel: '',
      address: '',
      payment: '',
      message: '',
    },
    // 預設loading 為false,不然會一直跑出來
    isLoading: false,
    products: [],
    tempProduct: {
      num: 0,
    },
    status: {
      loadingItem: '',
    },
    carts: {},
    cartTotal: 0,
  },
  methods: {
    // submitBtn() {
    //   console.log("send")
    // },
    // GET api/{uuid}/ec/products
    getProducts(page = 1) {
      this.isLoading = true;
      const url = `${this.user.apiUrl}/${this.user.uuid}/ec/products?page=${page}`;
      axios.get(url)
        .then((res) => {
          this.isLoading = false;
          console.log(res)
          this.products = res.data.data;
        })
        .catch((error) => {
          this.isLoading = false;
          console.log(error)
        })
    },
    // GET api/{uuid}/ec/product/{id} ; 網址要看清楚！因為是單一產品列表，所以product 是沒有s的
    getProduct(id) {
      this.status.loadingItem = id;
      const url = `${this.user.apiUrl}/${this.user.uuid}/ec/product/${id}`;
      axios.get(url)
        .then((res) => {
          this.tempProduct = res.data.data;
          // this.tempProduct.num = 1;
          this.$set(this.tempProduct, 'num', 1);
          $('#productModal').modal('show');
          this.status.loadingItem = '';
        })
        .catch((error) => {
          console.log(error.response)
        })
    },
    // 撈到之後就可以塞入購物車....
    // POST api/{uuid}/ec/shopping
    addToCart(id, quantity = 1) {
      this.status.loadingItem = id;
      const url = `${this.user.apiUrl}/${this.user.uuid}/ec/shopping`;
      const cart = {
        product: id,
        quantity: quantity,
      };
      console.log(cart)
      axios.post(url, cart)
        .then((res) => {
          this.status.loadingItem = '';
          console.log(res)
          this.tempProduct = res.data.data;
          // this.quantity = 1;
          $('#productModal').modal('hide');
          this.getCart();
        })
        .catch((error) => {
          console.log(error.response)
          // 有錯也要關起來啊!!!!!
          $('#productModal').modal('hide');
        })
    },
    // GET api/{uuid}/ec/shopping
    getCart() {
      const url = `${this.user.apiUrl}/${this.user.uuid}/ec/shopping`;
      axios.get(url)
        .then((res) => {
          // console.log(res)
          this.carts = res.data.data;
          this.updataCart();
        })
        .catch((error) => {
          console.log(error)
          // 有錯也要關起來啊!!!!!
          $('#productModal').modal('hide');
        })
    },
    updataCart() {
      this.cartTotal = 0;
      this.carts.forEach((item) => {
        this.cartTotal += item.product.price * item.quantity;
      });
      // this.cartTotal = total;
      // console.log(this.cartTotal)
    },
    // PATCH api/{uuid}/ec/shopping
    updatedQuantity(id, quantity) {
      this.isLoading = true;
      const url = `${this.user.apiUrl}/${this.user.uuid}/ec/shopping`;
      const cart = {
        product: id,
        quantity: quantity,
      };
      axios.patch(url, cart)
        .then((res) => {
          console.log(res)
          this.isLoading = false;
          this.getCart();
        })
        .catch((error) => {
          this.isLoading = false;
          console.log(error)
        })
    },
    // DELETE api/{uuid}/ec/shopping/all/product
    removeAll() {
      this.isLoading = true;
      const url = `${this.user.apiUrl}/${this.user.uuid}/ec/shopping/all/product`;
      axios.delete(url)
        .then(() => {
          this.isLoading = false;
          this.getCart();
          this.updataCart();
        })
        .catch((error) => {
          this.isLoading = false;
          console.log(error)
        })
    },
    // DELETE api/{uuid}/ec/shopping/{pid}
    removeSingleOne(id) {
      this.isLoading = true;
      const url = `${this.user.apiUrl}/${this.user.uuid}/ec/shopping/${id}`;
      axios.delete(url)
        .then(() => {
          this.isLoading = false;
          this.getCart();
          this.updataCart();
        })
        .catch((error) => {
          this.isLoading = false;
          console.log(error.response)
        })
    },
    doneOrder() {
      // POST api/{uuid}/ec/orders
      this.isLoading = true;
      const url = `${this.user.apiUrl}/${this.user.uuid}/ec/orders`;
      axios.post(url, this.form)
        .then((res) => {
          if (res.data.data.id) {
            this.isLoading = false;
            console.log(res)
            $('#ordersModal').modal('show');
            // 要重新渲染過!因為資料被送出去了
            this.getCart();
            this.form = '';
          }
        })
        .catch((error) => {
          // 有錯也要關起來啊!!!!!
          this.isLoading = false;
          $('#ordersModal').modal('hide');
          console.log(error.response)
        })
    },

  },
  created() {
    this.getProducts();
    this.getCart();
  }

})