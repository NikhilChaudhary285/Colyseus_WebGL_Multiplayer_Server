import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState.js";
import { Player } from "../schema/Player.js";

export class MyRoom extends Room {
  maxClients = 4;
  state = new GameState();

  onCreate() {

    // ✅ ALWAYS set state here
    this.state = new GameState();
    console.log("Room created:", this.roomId);

    // ===== MOVEMENT =====
    this.onMessage("move", (client, data) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;

      p.x = data.x;
      p.y = data.y;
      p.z = data.z;
      p.rotY = data.rotY;

      if (!p.sitting && !p.jumping)
        p.anim = data.anim ?? "idle";
    });

    // ===== JUMP =====
    this.onMessage("jump", (client) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;

      p.jumping = true;
      p.anim = "jump";

      this.clock.setTimeout(() => {
        const player = this.state.players.get(client.sessionId);
        if (!player) return;

        player.jumping = false;
        if (!player.sitting) player.anim = "idle";
      }, 350);
    });

    // ===== SIT =====
    this.onMessage("sit", (client, sit) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;

      p.sitting = sit;
      p.anim = sit ? "sit" : "idle";
    });

    // ===== SKIN =====
    this.onMessage("skin", (client, id) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      p.skin = id;
    });

    // ===== READY =====
    this.onMessage("ready", (client, value) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      p.ready = value;
    });

    // ===== NAME =====
    this.onMessage("setName", (client, name) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      p.name = name || "Player";
    });
  }

  onJoin(client: Client) {

  const player = new Player();

  this.state.players.set(client.sessionId, player);

  console.log("Player added to state:", this.state.players.size);

  // FORCE STATE CHANGE (debug)
  // this.broadcast("debug", "player joined");
}

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    console.log("Player left:", client.sessionId);
  }
}