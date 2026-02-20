// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 4.0.13
// 

using Colyseus.Schema;
#if UNITY_5_3_OR_NEWER
using UnityEngine.Scripting;
#endif

public partial class GameState : Schema {
#if UNITY_5_3_OR_NEWER
[Preserve]
#endif
public GameState() { }
	[Type(0, "map", typeof(MapSchema<Player>))]
	public MapSchema<Player> players = null;
}

