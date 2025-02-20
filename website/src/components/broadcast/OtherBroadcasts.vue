<template>
    <div class="other-broadcasts w-100">
        <div class="broadcast" v-for="broadcast in broadcasts" :key="broadcast.id">
            <div class="broadcast-top d-flex">
                <div class="broadcast-name flex-grow-1">{{ broadcast.relative_name || broadcast.name }}</div>
                <div class="broadcast-link" v-if="broadcast.stream_link">
                    <i class="fab fa-twitch" v-if="broadcast.stream_link.includes('twitch.tv')"></i>
                    {{ broadcast.stream_link.replace("twitch.tv/", "/") }}
                </div>
            </div>
            <div class="broadcast-main d-flex">
                <BreakMatch class="broadcast-match" :match="broadcast.live_match" :live="true" />
                <div class="broadcast-details">
<!--                    <div class="details">-->
<!--                        <span class="detail" v-if="broadcast.live_match.sub_event">{{ broadcast.live_match.sub_event}}</span>-->
<!--                        <span class="detail" v-if="broadcast.live_match.round">{{ broadcast.live_match.round}} </span>-->
<!--                        <span class="detail" v-if="broadcast.live_match.first_to">First to {{ broadcast.live_match.first_to}} </span>-->
<!--                    </div>-->
                    <div class="casters" v-if="broadcast.live_match && broadcast.live_match.casters">
                        Casters: <LinkedPlayers class="caster-names" :players="broadcast.live_match.casters"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import BreakMatch from "@/components/broadcast/break/BreakMatch";
import LinkedPlayers from "@/components/website/LinkedPlayers";

export default {
    name: "OtherBroadcasts",
    components: { LinkedPlayers, BreakMatch },
    props: ["startingBroadcast"],
    computed: {
        broadcast() {
            if (!this.startingBroadcast?.id) return {};

            return ReactiveThing("broadcast", {
                event: ReactiveThing("event", {
                    theme: ReactiveThing("theme")
                }),
                live_match: ReactiveThing("live_match", {
                    casters: ReactiveArray("casters"),
                    teams: ReactiveArray("teams", {
                        theme: ReactiveThing("theme")
                    })
                }),
                other_broadcasts: ReactiveArray("other_broadcasts", {
                    live_match: ReactiveThing("live_match", {
                        casters: ReactiveArray("casters"),
                        teams: ReactiveArray("teams", {
                            theme: ReactiveThing("theme")
                        })
                    })
                })
            })({ broadcast: this.startingBroadcast.id });
        },
        broadcasts() {
            if (!this.broadcast?.other_broadcasts?.length) return [];
            return [
                this.broadcast,
                ...(this.broadcast?.other_broadcasts || [])
            ];
        }
    }
};
</script>

<style scoped>
    .broadcast-match {
        width: 400px;
    }

    .broadcast-match >>> .match-next-details {
        display: none;
    }

    .broadcast-top {
        font-size: 2em;
        background-color: rgba(0, 0, 0, 0.2);
        padding: .25em .5em;
    }
    .broadcast-name {
        text-align: left;
    }
    .broadcast {
        margin-bottom: 2.5em;
    }
    .caster-names >>> a {
        color: inherit;
    }
    .broadcast-details {
        font-size: 2em;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex-grow: 1;
        padding: .25em 0;
    }
    .broadcast-details > div {
        margin-top: .25em;
    }

    span.detail {
        margin: 0 .5em;
    }
    span.detail:last-child {
        margin-right: 0;
    }
</style>
