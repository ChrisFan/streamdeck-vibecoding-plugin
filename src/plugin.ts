import streamDeck from "@elgato/streamdeck";
import { ClaudeSessionAction } from "./actions/claude-session";
import {
  ApproveAction,
  RejectAction,
  InterruptAction,
  ApproveAllAction,
} from "./actions/claude-control";
import { CaffeinateAction } from "./actions/caffeinate";
import { SkinToggleAction } from "./actions/skin-toggle";
import { initSkinManager } from "./lib/skin-manager";

streamDeck.actions.registerAction(new ClaudeSessionAction());
streamDeck.actions.registerAction(new ApproveAction());
streamDeck.actions.registerAction(new RejectAction());
streamDeck.actions.registerAction(new InterruptAction());
streamDeck.actions.registerAction(new ApproveAllAction());
streamDeck.actions.registerAction(new CaffeinateAction());
streamDeck.actions.registerAction(new SkinToggleAction());
streamDeck.connect().then(() => initSkinManager());
