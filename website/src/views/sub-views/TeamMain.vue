<template>
        <div class="container">
            <ContentRow v-if="team.accolades">
                <ContentThing :thing="accolade" type="event" :link-to="accolade.event" :theme="accolade.event && accolade.event.theme" v-for="accolade in team.accolades"
                              v-bind:key="accolade.id" :show-logo="true" :text="accolade.name" />
            </ContentRow>
            <ContentRow v-if="team.owners" :title="team.owners.length === 1 ? 'Owner' : 'Owners'">
                <ContentThing v-for="owner in team.owners" v-bind:key="owner.id"
                              type="player" :text="owner.name" :thing="owner" :theme="team.theme"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.captains" :title="team.captains.length === 1 ? 'Captain' : 'Captains'">
                <ContentThing v-for="captain in team.captains" v-bind:key="captain.id"
                              type="player" :text="captain.name" :thing="captain" :theme="team.theme"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.staff" title="Team staff">
                <ContentThing type="player" :text="staff.name" :thing="staff" :theme="team.theme" v-for="staff in team.staff" v-bind:key="staff.id"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.players" title="Players">
                <ContentThing :show-headshot="team.show_headshots" type="player" :text="player.name" :thing="player" :theme="team.theme" v-for="player in team.players" v-bind:key="player.id"></ContentThing>
            </ContentRow>
            <ContentRow v-if="showLimitedPlayers" title="Players">
                <ContentThing type="player" :thing="player" no-link="true" :text="player.name" :theme="team.theme" v-for="player in team.limited_players" v-bind:key="player.name"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.sister_teams" :title="`Sister team${team.sister_teams.length === 1 ? '' : 's'}`">
                <ContentThing type="team" :show-logo="true" :text="item.name" :thing="item" :theme="item.theme" v-for="item in team.sister_teams" v-bind:key="item.id"></ContentThing>
            </ContentRow>
            <ContentRow v-if="team.team_in_other_tournaments" title="Team in other tournaments">
                <ContentThing type="team" :show-logo="true" :text="item.event ? `${item.name} (${item.event.short})` : item.name" :thing="item" :theme="item.theme" v-for="item in team.team_in_other_tournaments" v-bind:key="item.id"></ContentThing>
            </ContentRow>

            <div class="news mt-3">
                <div class="news-category" v-for="([categoryName, category]) in Object.entries(newsCategories)" v-bind:key="categoryName">
                    <h2>{{ categoryName }}</h2>
                    <div class="row">
                        <News class="ct-passive col-6 col-md-4 col-lg-3 mb-3" v-for="item in category" :item="item" v-bind:key="item.id" />
                    </div>
                </div>
            </div>
    </div>
</template>

<script>
import ContentThing from "@/components/website/ContentThing";
import ContentRow from "@/components/website/ContentRow";
import News from "@/components/website/news/News";
export default {
    name: "TeamMain",
    components: { ContentRow, ContentThing, News },
    props: ["team"],
    computed: {
        filteredNewsItems() {
            if (!this.team.news_items) return [];
            return this.team.news_items.filter(item => {
                if (item.hide_from_local_listing) return false;
                if (!item.enabled) return false;
                if (!item.released) return false;
                if (new Date(item.released) > new Date()) return false;
                return true;
            });
        },
        newsCategories() {
            const categories = {};
            this.filteredNewsItems.forEach(news => {
                const category = news.category || "Articles";
                if (!categories[category]) categories[category] = [];
                categories[category].push(news);
            });

            return categories;
        },
        showLimitedPlayers() {
            return ((this.team.players || [])?.length === 0) && (this.team.limited_players || []).length !== 0;
        }
    }
};
</script>

<style scoped>

</style>
