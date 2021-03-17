<!-- 

  @author - Mr Dk.
  @version - 2021/03/17

  @description - 
    Component for displaying IP address.

-->

<template>
  <div :class="theme">

    <p align="right" v-if="ipAddress">
      <!-- {{ ipAddress + " (" + location + ") " }} -->
      {{ location }}
    </p>
    
  </div>
</template>

<style>

</style>

<script>

export default {
  name: "HeaderLocation",
  props: [ "theme" ],
  data() {
    return {
      ipAddress: "",
      location: "",

      provinces: [
        "北京", "天津", "上海", "重庆",
        "河北", "山西", "辽宁", "吉林", "黑龙江",
        "江苏", "浙江", "安徽", "福建", "江西",
        "山东", "河南", "湖北", "湖南",
        "广东", "海南",
        "四川", "贵州", "云南",
        "陕西", "甘肃", "青海",
        // "台湾", "香港", "澳门"
        "内蒙古", "广西", "西藏", "宁夏", "新疆"
      ]
    };
  },
  methods: {

    setIP() {
      if (window.ip) {
        this.ipAddress = window.ip.cip;
        this.location = window.ip.cname;

        // jump to different mirroring sites if necessary
        if (!this.isWebsiteInsideChina() && this.isIPInsideChina(this.location)) {
          // requesting server outside China (GitHub pages)
          // but the IP is inside
          this.hint(
            "Your IP Address is more suitable to request the site inside China mainland.",
            "Hint",
            "https://" + this.$store.state.githubapi.baseHostInChina + "/blog/#" + this.$route.fullPath
          );
        } else if (this.isWebsiteInsideChina() && !this.isIPInsideChina(this.location)) {
          // requesting server inside China
          // but the IP is outside
          this.hint(
            "Your IP Address is more suitable to request the site outside China mainland.",
            "Hint",
            this.$store.state.githubapi.baseUrl + this.$route.fullPath
          );
        }
      }
    },

    hint(message, title, jumpUrl) {
      this.$confirm(
        message,
        title,
        {
          confirmButtonText: "Jump there",
          cancelButtonText: "Stay here",
          type: "info"
        }
      ).then(() => {
        window.location.href = jumpUrl;
      }).catch(() => {
        // do nothing
      });
    },

    isWebsiteInsideChina() {
      const url = window.location.href;
      const hostInChina = this.$store.state.githubapi.baseHostInChina;
      if (url.indexOf(hostInChina) != -1 || url.indexOf("localhost") != -1) {
        return true;
      }
      return false;
    },

    isIPInsideChina() {
      if (this.location === "") {
        return true;
      }

      for (let i = 0; i < this.provinces.length; i++) {
        if (-1 != this.location.indexOf(this.provinces[i])) {
          return true;
        }
      }

      // debug
      if (-1 != this.location.indexOf("localhost")) {
        return true;
      }

      return false;
    }

  },

  mounted() {
    this.setIP();
  }
}
</script>
