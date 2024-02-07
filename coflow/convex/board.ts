import { mutation } from "./_generated/server";
import { v } from "convex/values";

const images = [
    "/placeholders/01.svg",
    "/placeholders/02.svg",
    "/placeholders/03.svg",
    "/placeholders/04.svg",
    "/placeholders/05.svg",
    "/placeholders/06.svg",
    "/placeholders/07.svg",
    "/placeholders/08.svg",
    "/placeholders/09.svg",
    "/placeholders/10.svg",
];

export const create = mutation({
    args: {
        orgId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const randomImage = images[Math.floor(Math.random() * images.length)];

        const board = await ctx.db.insert("boards", {
            title: args.title,
            orgId: args.orgId,
            authorId: identity.subject,
            authorName: identity.name!,
            imageUrl: randomImage,
        });

        return board;
    },
});

export const remove = mutation({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        // TODO: Later check to delete favorite relation as well

        await ctx.db.delete(args.id);
    },
});

export const update = mutation({
    args: { id: v.id("boards"), title: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const title = args.title.trim();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        if (!title) {
            throw new Error("Title is required");
        }

        if (title.length > 60) {
            throw new Error("Title cannot be longer than 60 characters");
        }

        const board = await ctx.db.patch(args.id, {
            title: args.title,
        });

        return board;
    },
});

export const favourite = mutation({
    args: { id: v.id("boards"), orgId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const board = await ctx.db.get(args.id);

        if (!board) {
            throw new Error("Board not found");
        }

        const userId = identity.subject;

        const existingFavourite = await ctx.db
            .query("userFavourites")
            .withIndex("by_user_board_org", (q) =>
                q
                    .eq("userId", userId)
                    .eq("boardId", board._id)
                    .eq("orgId", args.orgId)
            )
            .unique();

        if (existingFavourite) {
            throw new Error("Board already favourited");
        }

        await ctx.db.insert("userFavourites", {
            userId,
            boardId: board._id,
            orgId: args.orgId,
        });

        return board;
    },
});

export const unfavourite = mutation({
    args: { id: v.id("boards"), orgId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const board = await ctx.db.get(args.id);

        if (!board) {
            throw new Error("Board not found");
        }

        const userId = identity.subject;

        const existingFavourite = await ctx.db
            .query("userFavourites")
            .withIndex(
                "by_user_board",
                (q) => q.eq("userId", userId).eq("boardId", board._id)
                // TODO: check if orgId needed
            )
            .unique();

        if (!existingFavourite) {
            throw new Error("Favourited board not found");
        }

        await ctx.db.delete(existingFavourite._id);
        return board;
    },
});
