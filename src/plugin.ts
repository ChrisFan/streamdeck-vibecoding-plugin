import streamDeck from "@elgato/streamdeck";
import { ClaudeSessionAction } from "./actions/claude-session";
import {
  ApproveAction,
  RejectAction,
  InterruptAction,
  ApproveAllAction,
} from "./actions/claude-control";

streamDeck.actions.registerAction(new ClaudeSessionAction());
streamDeck.actions.registerAction(new ApproveAction());
streamDeck.actions.registerAction(new RejectAction());
streamDeck.actions.registerAction(new InterruptAction());
streamDeck.actions.registerAction(new ApproveAllAction());
streamDeck.connect();
