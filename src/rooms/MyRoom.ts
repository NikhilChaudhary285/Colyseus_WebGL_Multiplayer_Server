import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState.js";
import { Player } from "../schema/Player.js";

export class MyRoom extends Room {
  maxClients = 4;
  state = new GameState();
  joinCounter = 0;

  onCreate() {
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
    });

    // ===== SIT =====
    this.onMessage("sit", (client, sit) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      p.sitting = sit;
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

    // ===== START GAME REQUEST =====
    this.onMessage("startGame", (client) => {

      // ONLY HOST MAY START
      if (client.sessionId !== this.state.hostSessionId) return;

      // VERIFY READY
      let allReady = true;
      this.state.players.forEach(p => {
        if (!p.ready) allReady = false;
      });

      if (!allReady) return;

      this.startCountdown();
    });
  }

  startCountdown() {

    this.state.countdown = 3;

    const timer = this.clock.setInterval(() => {

      this.state.countdown--;

      if (this.state.countdown <= 0) {
        timer.clear();
        this.startMatch();
      }

    }, 1000);
  }

  startMatch() {

    let index = 0;

    this.state.players.forEach(p => {
      p.spawnIndex = index++;
    });

    this.state.matchStarted = true;

    console.log("MATCH STARTED");
  }

  onJoin(client: Client) {

    const player = new Player();

    player.joinOrder = this.joinCounter++;
    player.spawnIndex = player.joinOrder;
    player.ready = false;
    player.name = "Player";

    this.state.players.set(client.sessionId, player);

    // FIRST PLAYER = HOST
    if (!this.state.hostSessionId)
      this.state.hostSessionId = client.sessionId;

    console.log("Player joined:", client.sessionId);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}