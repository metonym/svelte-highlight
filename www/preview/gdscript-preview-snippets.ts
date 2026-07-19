export type GdscriptPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const gdscriptPreviewSnippets: GdscriptPreviewSnippet[] = [
  {
    title: "Player controller",
    description: "annotations, signals, typed properties, and control flow",
    code: `extends CharacterBody2D
class_name Player

@export var speed: float = 300.0
@onready var sprite: Sprite2D = $Sprite2D

signal health_changed(new_health: int)

var _health := 100

func _ready() -> void:
	sprite.play("idle")

func take_damage(amount: int) -> void:
	_health -= amount
	if _health <= 0:
		queue_free()
	emit_signal("health_changed", _health)

func _physics_process(delta: float) -> void:
	var direction := Input.get_vector("left", "right", "up", "down")
	velocity = direction * speed
	move_and_slide()`,
  },
  {
    title: "Export annotations and node paths",
    description: "@export/@onready annotations and $NodePath access",
    code: `@export_range(0, 100) var health: int = 100
@export_category("Movement")
@export var speed: float = 250.0
@export_flags("Fire", "Water", "Earth", "Air") var elements := 0

@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var hitbox := $Hitbox/CollisionShape2D
@onready var label: Label = %HealthLabel`,
  },
  {
    title: "Match statement",
    description: "GDScript's pattern matching, distinct from Python's",
    code: `func _handle_input(action: String) -> void:
	match action:
		"jump":
			velocity.y = -400.0
		"crouch", "slide":
			state = State.CROUCHING
		_:
			push_warning("unknown action: %s" % action)`,
  },
];
