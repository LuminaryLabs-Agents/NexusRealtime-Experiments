# VR Platformer Board

A NexusRealtime experiment that composes the maximum-feature 2D platformer + XR board ProtoKit stack.

## Goal

```txt
2D platformer simulation
+
floating 6DOF-style VR board in front of the player
+
stereoscopic render descriptors
+
XR pose/input/comfort/spatial anchor policies
```

## ProtoKits Composed

```txt
platformer-level-domain-kit
platformer-avatar-domain-kit
platformer-physics-system-kit
platformer-collision-domain-kit
platformer-object-domain-kit
platformer-camera-domain-kit
platformer-render-descriptor-kit
platformer-effects-domain-kit
platformer-parallax-domain-kit
platformer-objective-sequence-kit
xr-pose-domain-kit
xr-input-adapter-kit
spatial-anchor-domain-kit
spatial-game-board-domain-kit
xr-comfort-domain-kit
stereoscopic-render-domain-kit
xr-platformer-render-adapter-kit
```

## Controls

```txt
A / D or Arrow Left / Arrow Right = move
Space / W / Arrow Up = jump
R = reset
Mouse drag = fake head movement around board
```

## Architecture Boundary

The route is a browser host. It owns Canvas drawing, input listeners, and visual presentation.

The ProtoKits own the platformer state descriptors, XR board state, pose descriptors, comfort policy, and stereo view descriptors.

No gameplay objective is decided by Canvas drawing.
