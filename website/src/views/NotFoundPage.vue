<template>
    <div id="app">
        <WebsiteNav/>
        <NotFoundContent/>
    </div>
</template>

<script>
import WebsiteNav from "@/components/website/WebsiteNav";
import NotFoundContent from "@/views/sub-views/NotFoundContent";

export default {
    name: "NotFoundPage",
    components: { NotFoundContent, WebsiteNav },
    beforeCreate () {
        document.body.className = "website";
    }
};
</script>

<style scoped>
@import "~@/assets/bootstrap.css";
@import "~@/assets/app.css";

</style>
