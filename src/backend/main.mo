import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Character {
    public func compare(character1 : Character, character2 : Character) : Order.Order {
      Nat.compare(character1.id, character2.id);
    };
  };

  type Character = {
    id : Nat;
    name : Text;
    pointValue : Nat;
    active : Bool;
  };

  module PlayerData {
    public func compare(playerData1 : PlayerData, playerData2 : PlayerData) : Order.Order {
      Nat.compare(playerData1.score, playerData2.score);
    };

    public func compareByScoreDescending(playerData1 : PlayerData, playerData2 : PlayerData) : Order.Order {
      switch (Nat.compare(playerData2.score, playerData1.score)) {
        case (#equal) { Nat.compare(playerData1.stolenCount, playerData2.stolenCount) };
        case (order) { order };
      };
    };
  };

  type PlayerData = {
    score : Nat;
    stolenCount : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let defaultCharacters = [
    (0, { id = 0; name = "Skibidi Toilet"; pointValue = 10; active = true }),
    (1, { id = 1; name = "Tralalero Tralala"; pointValue = 15; active = true }),
    (2, { id = 2; name = "Bombardiro Crocodillo"; pointValue = 20; active = true }),
    (3, { id = 3; name = "Tung Tung Tung Sahur"; pointValue = 12; active = true }),
    (4, { id = 4; name = "Ballerina Cappuccina"; pointValue = 18; active = true }),
    (5, { id = 5; name = "Brr Brr Patapim"; pointValue = 8; active = true }),
    (6, { id = 6; name = "Glorbo Finkus"; pointValue = 25; active = true }),
    (7, { id = 7; name = "Chimpanzini Bananini"; pointValue = 14; active = true }),
  ];

  let characters = Map.fromIter<Nat, Character>(defaultCharacters.values());
  let playerData = Map.empty<Principal, PlayerData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCharacters() : async [Character] {
    characters.values().toArray().filter(func(char) { char.active });
  };

  public shared ({ caller }) func stealCharacter(id : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can steal characters");
    };

    switch (characters.get(id)) {
      case (null) { Runtime.trap("Character not found") };
      case (?character) {
        if (not character.active) {
          Runtime.trap("Character is not active");
        };
        let currentData = switch (playerData.get(caller)) {
          case (null) { { score = 0; stolenCount = 0 } };
          case (?data) { data };
        };
        let newScore = currentData.score + character.pointValue;
        let newStolenCount = currentData.stolenCount + 1;

        playerData.add(caller, { score = newScore; stolenCount = newStolenCount });
        character.pointValue;
      };
    };
  };

  public query ({ caller }) func getLeaderboard() : async [(Principal, PlayerData)] {
    let entries = playerData.entries().toArray();
    let sortedEntries = entries.sort(
      func(a, b) {
        PlayerData.compareByScoreDescending(a.1, b.1);
      }
    );
    sortedEntries.sliceToArray(0, Nat.min(10, sortedEntries.size()));
  };

  public shared ({ caller }) func addCharacter(name : Text, pointValue : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let newId = characters.size();
    let newCharacter = {
      id = newId;
      name;
      pointValue;
      active = true;
    };
    characters.add(newId, newCharacter);
  };

  public shared ({ caller }) func removeCharacter(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (characters.get(id)) {
      case (null) { Runtime.trap("Character not found") };
      case (?character) {
        let updatedCharacter = { character with active = false };
        characters.add(id, updatedCharacter);
      };
    };
  };

  public shared ({ caller }) func resetAllScores() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let playerIter = playerData.keys();
    playerIter.forEach(
      func(principal) {
        playerData.add(principal, { score = 0; stolenCount = 0 });
      }
    );
  };
};
