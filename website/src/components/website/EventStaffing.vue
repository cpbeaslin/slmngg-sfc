<template>
    <div class="event-staffing" v-if="appearances.length">
        <!-- Table: staff vs roles, counts of staff in that role -->
        <table class="table table-sm table-dark table-hover table-bordered">
            <thead>
                <th class="px-2">Staff</th>
                <th class="px-2" v-for="role in roles" :key="role">{{ role }}</th>
                <th v-b-tooltip="'Number of matches listed as staff'">Total</th>
            </thead>
            <tr v-for="staff in appearances" :key="staff.id">
                <td><LinkedPlayers :players="[staff.user]" /></td>
                <td v-for="role in roles" :key="role" :class="{'ct-active': staff.listed_roles.indexOf(role) !== -1}">
                    {{ staff.roles[role] || '-' }}
                </td>
                <td>{{ staff.matches.size }}</td>
            </tr>
        </table>
    </div>
</template>

<script>
import { ReactiveArray, ReactiveThing } from "@/utils/reactive";
import LinkedPlayers from "@/components/website/LinkedPlayers";

export default {
    name: "EventStaffing",
    components: { LinkedPlayers },
    props: ["event"],
    computed: {
        matches() {
            if (!this.event?.matches?.length) return [];
            return ReactiveArray("matches", {
                casters: ReactiveArray("casters"),
                player_relationships: ReactiveArray("player_relationships", {
                    player: ReactiveThing("player")
                })
            })(this.event);
        },
        roles() {
            const roles = [];
            this.appearances.forEach(staff => {
                Object.keys(staff.roles).forEach(roleText => {
                    if (!roles.includes(roleText)) roles.push(roleText);
                });
            });
            return roles;
        },
        appearances() {
            const staff = [];
            function addToStaff(id, name, role, matchID) {
                let player = staff.find(s => s.id === id);
                if (!player) {
                    staff.push({ id: id, name: name, roles: {}, matches: new Set(), user: { id, name } });
                    player = staff[staff.length - 1];
                }
                if (!player.roles[role]) {
                    player.roles[role] = 0;
                }
                player.roles[role]++;
                player.matches.add(matchID);
            }

            this.matches.forEach(match => {
                (match.casters || []).forEach(caster => {
                    if (caster?.id) addToStaff(caster.id, caster.name, "Caster", match.id);
                });
                (match.player_relationships || []).forEach(pr => {
                    if (pr?.player?.id) addToStaff(pr.player.id, pr.player.name, pr.singular_name, match.id);
                });
            });
            return staff.sort((a, b) => b.matches.size - a.matches.size).map(s => {
                s.listed_roles = Object.keys(s.roles).filter(role => this.isListedOnEvent(s.id, role));
                return s;
            });
        },
        eventRelationships() {
            return ReactiveThing("event", {
                player_relationships: ReactiveArray("player_relationships")
            })({ event: this.event.id });
        }
    },
    methods: {
        isListedOnEvent(playerID, role) {
            // using rec + ids here
            if (role === "Caster") {
                return this.eventRelationships?.casters?.length && this.eventRelationships.casters.includes("rec" + playerID);
            }
            if (!this.eventRelationships?.player_relationships?.length) return false;
            const rel = this.eventRelationships.player_relationships.find(r => r.player?.[0] && r.player[0] === "rec" + playerID && r.singular_name === role);
            if (rel) return true;
            return false;
        }
    }
};
</script>

<style scoped>

</style>
