<template>
    <div class="container" v-if="user && user.name">
        <h1>SLMN.GG Dashboard</h1>
        <div class="client-broadcasts d-flex mb-2" v-if="client && client.broadcast">
            <BroadcastSwitcher :broadcasts="client.broadcast" />
            <router-link v-if="liveMatch" :to="url('detailed', liveMatch)">
                <MatchThumbnail class="mini-thumbnail" :match="liveMatch" stripe-height="2px"/>
            </router-link>
            <div class="match-thumbnail-ghost default-thing mini-thumbnail" v-if="!liveMatch"></div>
            <div class="spacer flex-grow-1"></div>
            <PreviewProgramDisplay :broadcast="broadcast" />
            <div class="clocks d-flex">
                <DashboardClock title="Local" />
                <DashboardClock title="Broadcast" :timezone="broadcast.timezone || 'America/New_York'" />
            </div>
        </div>
        <div class="broadcast-editor mb-3" v-if="client && client.broadcast">
            <BroadcastEditor :client="client"/>
        </div>
        <DashboardModule title="Match Editor" icon-class="fas fa-pennant" class="broadcast-match-editor mb-2" v-if="liveMatch" start-opened>
            <MatchEditor :hide-match-extras="true" :match="liveMatch"></MatchEditor>
        </DashboardModule>
        <DashboardModule title="Bracket Implications" icon-class="fas fa-sitemap" class="broadcast-bracket-editor mb-2" v-if="bracketCount">
            <BracketImplications :match="liveMatch" link-to-detailed-match show-resolve-button />
        </DashboardModule>
        <DashboardModule class="bracket-viewer mb-2" icon-class="fas fa-sitemap"  :title="bracketCount === 1 ? 'Bracket' : 'Brackets'" v-if="bracketCount">
            <Bracket scale="0.75" v-for="bracket in bracketData" :event="liveMatch.event" :bracket="bracket" :key="bracket.id"></Bracket>
        </DashboardModule>
        <ScheduleEditor class="broadcast-schedule-editor mb-2" :broadcast="broadcast"></ScheduleEditor>
        <DashboardModule title="Twitch Controls" icon-class="fas fa-wrench" content-class="p-2" v-if="broadcast">
            <template v-slot:header v-if="broadcast.stream_link">{{ broadcast.stream_link }}</template>
            <Predictions v-if="liveMatch" :client="client"/>
            <Commercials v-if="hasPermission('Full broadcast permissions')" :client="client" />
            <b-button class="mt-2" variant="secondary" @click="updateTitle" :disabled="!liveMatch">
                <i class="fal fa-fw fa-wand-magic mr-1"></i>Update title
            </b-button>
        </DashboardModule>
        <CommsControl v-if="useTeamComms" :match="liveMatch"/>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveRoot, ReactiveThing } from "@/utils/reactive";
import { url } from "@/utils/content-utils";
import BroadcastSwitcher from "@/components/website/dashboard/BroadcastSwitcher";
import MatchThumbnail from "@/components/website/match/MatchThumbnail";
import MatchEditor from "@/components/website/dashboard/MatchEditor";
import { BButton } from "bootstrap-vue";
import { updateAutomaticTitle } from "@/utils/dashboard";
import Predictions from "@/components/website/dashboard/Predictions";
import CommsControl from "@/components/website/dashboard/CommsControls";
import Commercials from "@/components/website/dashboard/Commercials";
import BroadcastEditor from "@/components/website/dashboard/BroadcastEditor";
import ScheduleEditor from "@/components/website/dashboard/ScheduleEditor";
import DashboardClock from "@/components/website/dashboard/DashboardClock";
import DashboardModule from "@/components/website/dashboard/DashboardModule.vue";
import BracketImplications from "@/components/website/dashboard/BracketImplications.vue";
import PreviewProgramDisplay from "@/components/website/dashboard/PreviewProgramDisplay.vue";
import Bracket from "@/components/website/bracket/Bracket.vue";

export default {
    name: "Dashboard",
    components: { Bracket, PreviewProgramDisplay, BracketImplications, DashboardModule, DashboardClock, ScheduleEditor, BroadcastEditor, CommsControl, Commercials, Predictions, MatchEditor, MatchThumbnail, BroadcastSwitcher, BButton },
    computed: {
        user() {
            if (!this.$root.auth.user?.airtableID) return {};
            return ReactiveRoot(this.$root.auth.user.airtableID, {
                clients: ReactiveArray("clients", {
                    broadcast: ReactiveArray("broadcast", {
                        event: ReactiveThing("event", {
                            theme: ReactiveThing("theme")
                        }),
                        live_match: ReactiveThing("live_match", {
                            maps: ReactiveArray("maps", {
                                map: ReactiveThing("map"),
                                winner: ReactiveThing("winner"),
                                banner: ReactiveThing("banner"),
                                picker: ReactiveThing("picker")
                            }),
                            teams: ReactiveArray("teams", {
                                theme: ReactiveThing("theme")
                            }),
                            event: ReactiveThing("event", {
                                theme: ReactiveThing("theme")
                            })
                        })
                    })
                }) // TODO: make this just client
            });
        },
        client() {
            const client = this.user?.clients?.[0];
            if (!client?.broadcast) return {};
            return client;
        },
        broadcast() {
            return this.client?.broadcast?.[0];
        },
        liveMatch() {
            return this.broadcast?.live_match;
        },
        useTeamComms() {
            return (this.broadcast?.broadcast_settings || []).includes("Connect for team comms");
        },
        bracketCount() {
            return this.liveMatch?.brackets?.length;
        },
        bracketData() {
            return ReactiveArray("brackets", {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                ordered_matches: ReactiveArray("ordered_matches", {
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    })
                })
            })(this.liveMatch);
        }
    },
    methods: {
        url,
        async updateTitle() {
            const response = await updateAutomaticTitle(this.$root.auth, "self", "create");
            if (response.error) return; // handled by internal
            this.$notyf.success({
                message: response.data,
                duration: 20000
            });
        },
        hasPermission(permission) {
            return (this.user.website_settings || []).includes(permission);
        }
    },
    watch: {
        client(oldClient, newClient) {
            if (!this.client?.key) return;
            if (oldClient?.key === newClient?.key) return;
            console.log("prod-join", this.client?.key);
            this.$socket.client.emit("prod-join", this.client?.key);
        }
    },
    metaInfo: () => ({
        title: "Dashboard"
    })
};
</script>

<style scoped>
    .mini-thumbnail {
        height: 46px;
        width: 90px;
        margin-left: 10px;
    }
    .match-thumbnail-ghost {
        height: 48px;
        border-bottom-width: 2px;
        border-bottom-style: solid;
    }
    .bracket-viewer >>> .module-content .bracket {
        padding: 10px 20px 0px 20px;
    }
    .bracket-viewer >>> .module-content {
        overflow-x: scroll;
    }


    .bracket-viewer >>> .module-content::-webkit-scrollbar-track {
        border-radius: 4px;
        background-color: transparent;
    }

    .bracket-viewer >>> .module-content::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: transparent;
    }

    .bracket-viewer >>> .module-content::-webkit-scrollbar-thumb {
        border-radius: 4px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: #222;
        transition: background-color 300ms ease;
    }

    .bracket-viewer >>> .module-content:hover::-webkit-scrollbar-thumb,
    .bracket-viewer >>> .module-content:active::-webkit-scrollbar-thumb {
        background-color: #333;
    }
</style>
