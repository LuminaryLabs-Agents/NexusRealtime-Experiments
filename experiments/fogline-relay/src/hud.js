export function createHud(root = document) {
  const status = root.querySelector("#status");
  const prompt = root.querySelector("#prompt");
  const controls = root.querySelector("#controls");
  return {
    draw(snapshot) {
      const game = snapshot.game;
      const objective = snapshot.objective;
      const currentStep = objective?.steps?.[objective.currentStepIndex];
      status.textContent = `${game.stats.scanned}/3 relays · health ${Math.round(game.player.health)}% · ${currentStep?.label ?? game.status}`;
      prompt.textContent = game.sequence?.prompt ?? game.prompt ?? "";
      controls.textContent = "WASD move · mouse/←→ look · hold E scan · R restart · click canvas to lock";
    }
  };
}
