<template>
    <b-nav-item-dropdown class="logged-in-user" variant="dark" right>
        <template #button-content>
            <div class="avatar" :style="avatar"></div>
            <div class="name">{{ user.name }}</div>
        </template>
        <b-dropdown-item variant="dark" :to="url('player', { id: playerID })" active-class="active">Player page</b-dropdown-item>
        <b-dropdown-item variant="dark" :href="rootLinkExternal('/profile')" :to="rootLinkRouter('/profile')" active-class="active">Edit profile</b-dropdown-item>
        <b-dropdown-item v-if="isProduction" variant="dark" :href="rootLinkExternal('/dashboard')" :to="rootLinkRouter('/dashboard')" active-class="active">Dashboard</b-dropdown-item>
    </b-nav-item-dropdown>
</template>

<script>
import { url } from "@/utils/content-utils.js";
import { BDropdownItem, BNavItemDropdown } from "bootstrap-vue";
import { isAuthenticated, isOnMainDomain } from "@/utils/auth";
import { getMainDomain } from "@/utils/fetch";

export default {
    name: "LoggedInUser",
    components: {
        BDropdownItem, BNavItemDropdown
    },
    computed: {
        user() {
            return this.$root.auth.user;
        },
        playerID() {
            return this.user?.airtableID;
        },
        avatar() {
            return {
                backgroundImage: `url(${this.user.avatar})`
            };
        },
        isProduction() {
            if (!isAuthenticated(this.$root)) return false;
            return this.$root.authUser?.clients?.length;
        }
    },
    methods: {
        url,

        /*
        * for simplicity's sake, I'm having any editable stuff on the root domain
        * these use either href or to for external/routable links
        * */
        rootLinkExternal(url) {
            return isOnMainDomain() ? null : getMainDomain() + url;
        },
        rootLinkRouter(url) {
            return isOnMainDomain() ? url : null;
        }

    }
};
</script>

<style scoped>
    .logged-in-user {
        display: flex !important;
    }
    .avatar {
        width: 2em;
        height: 2em;
        border-radius: 50%;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        margin: -0.5rem 0.5rem -0.5rem 0;
    }
    .logged-in-user >>> .dropdown-toggle {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
