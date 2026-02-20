import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState.js";
import { Player } from "../schema/Player.js";

export class MyRoom extends Room {
  maxClients = 4;
  state = new GameState();

  onCreate() {

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

      setTimeout(() => {
        if (!p) return;
        p.jumping = false;
        if (!p.sitting) p.anim = "idle";
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
  }

  onJoin(client: Client) {
    const player = new Player();
    player.anim = "idle";
    player.skin = 0;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}