<template>
    <div class="news-thumbnail default-thing" :style="border">
        <div class="news-custom-thumbnail w-100 bg-center" v-if="customThumbnail" :style="customThumbnail"></div>
        <div class="news-generated-thumbnail w-100 flex-center" v-else :style="{ backgroundColor: generatedThumbnail.backgroundColor }">
            <div class="news-generated-thumbnail-logo bg-center" :style="{backgroundImage: generatedThumbnail.backgroundImage}"></div>
        </div>
    </div>
</template>

<script>
import { resizedImage } from "@/utils/images";

export default {
    name: "NewsThumbnail",
    props: ["item"],
    computed: {
        border() {
            return {
                borderColor: this.customThumbnail
                    ? (this.connectionTheme?.color_theme || this.connectionTheme?.color_logo_background || this.connectionTheme?.color_logo_accent)
                    : (this.connectionTheme?.color_accent || this.connectionTheme?.color_logo_accent || this.connectionTheme?.color_theme)
            };
        },
        customThumbnail() {
            if (!this.item.thumbnail) {
                if (this.item.embed && this.item.use_embed_thumbnail) {
                    const vodURL = new URL(this.item.embed);
                    if (["www.youtube.com", "youtube.com"].includes(vodURL.host)) {
                        return { backgroundImage: `url(https://i.ytimg.com/vi/${vodURL.searchParams.get("v")}/maxresdefault.jpg)` };
                    }
                    if (["youtu.be"].includes(vodURL.host)) {
                        return { backgroundImage: `url(https://i.ytimg.com/vi/${vodURL.pathname.slice(1)}/maxresdefault.jpg)` };
                    }
                }
                return null;
            }

            return resizedImage(this.item, ["thumbnail"], "h-300"); // gets centered vertically
        },
        connectionTheme() {
            if (this.item?.event?.theme && this.item?.prefer_event) return this.item.event.theme;
            if (this.item?.team?.theme) return this.item.team.theme;
            if (this.item?.event?.theme) return this.item.event.theme;
            return null;
        },
        generatedThumbnail() {
            if (!this.connectionTheme) return {};

            return {
                backgroundColor: this.connectionTheme.color_logo_background,
                ...resizedImage(this.connectionTheme, ["default_wordmark", "default_logo"], "h-200")
            };
        }
    }
};
</script>

<style scoped>
    .news-thumbnail:before {
        padding-top: 50%;
        display: block;
        content: " "
    }
    .news-thumbnail {
        background: #333;
        display: flex;
        border-bottom-width: 4px;
        border-bottom-style: solid;
        position: relative;
    }
    .news-custom-thumbnail {
        background-size: cover;
        /* crops 16:9 to 2:1 */
    }
    .news-generated-thumbnail-logo {
        width: calc(100% - 16px);
        height: calc(100% - 24px);
    }
</style>
