<template>
    <div class="break-matchup d-flex flex-row w-100 h-100">
        <BreakMatchupTeam class="team" v-for="(team, i) in teams" v-bind:key="team.id" :team="team" :style="{order: (i*2)-1}"/>
        <div class="break-vs">vs</div>
    </div>
</template>

<script>
import BreakMatchupTeam from "@/components/broadcast/break/BreakMatchupTeam";
export default {
    name: "BreakMatchup",
    components: { BreakMatchupTeam },
    props: ["match"],
    computed: {
        teams() {
            return this.match?.teams || [];
        }
    }
};
</script>

<style scoped>
    .team {
        width: 100%;
        height: 80%;
    }

    .break-vs {
        font-size: 5em;
        text-transform: uppercase;
        padding: .4em;
        font-weight: bold;
    }
</style>
