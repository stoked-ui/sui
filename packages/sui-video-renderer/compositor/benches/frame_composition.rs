use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use video_compositor::{Compositor, Layer, Transform, BlendMode, Color};

fn create_simple_layers() -> Vec<Layer> {
    vec![
        Layer::solid_color(
            Color::new(50, 50, 50, 255),
            Transform::new().with_scale(1.0),
        )
        .with_z_index(0),
        Layer::solid_color(
            Color::new(255, 0, 0, 255),
            Transform::new()
                .with_position(100.0, 100.0)
                .with_scale(0.5)
                .with_opacity(0.8),
        )
        .with_z_index(1),
        Layer::solid_color(
            Color::new(0, 255, 0, 255),
            Transform::new()
                .with_position(200.0, 200.0)
                .with_scale(0.3)
                .with_opacity(0.6),
        )
        .with_z_index(2),
    ]
}

fn create_complex_layers() -> Vec<Layer> {
    let blend_modes = [
        BlendMode::Normal,
        BlendMode::Multiply,
        BlendMode::Screen,
        BlendMode::Overlay,
    ];

    (0..10)
        .map(|i| {
            Layer::solid_color(
                Color::new(
                    ((i * 37) % 256) as u8,
                    ((i * 73) % 256) as u8,
                    ((i * 137) % 256) as u8,
                    255,
                ),
                Transform::new()
                    .with_position((i * 50) as f32, (i * 50) as f32)
                    .with_scale_xy(0.8 - (i as f32 * 0.05), 0.8 - (i as f32 * 0.05))
                    .with_opacity(1.0 - (i as f32 * 0.08)),
            )
            .with_blend_mode(blend_modes[i % blend_modes.len()])
            .with_z_index(i as i32)
        })
        .collect()
}

fn create_highres_layers() -> Vec<Layer> {
    vec![
        Layer::solid_color(
            Color::new(0, 0, 0, 255),
            Transform::new().with_scale(1.0),
        )
        .with_z_index(0),
        Layer::solid_color(
            Color::new(255, 100, 50, 255),
            Transform::new()
                .with_position(500.0, 500.0)
                .with_scale(0.6),
        )
        .with_z_index(1),
        Layer::solid_color(
            Color::new(50, 150, 255, 255),
            Transform::new()
                .with_position(1000.0, 500.0)
                .with_scale(0.6),
        )
        .with_blend_mode(BlendMode::Multiply)
        .with_z_index(2),
        Layer::solid_color(
            Color::new(100, 255, 100, 255),
            Transform::new()
                .with_position(750.0, 1000.0)
                .with_scale(0.4)
                .with_opacity(0.7),
        )
        .with_blend_mode(BlendMode::Overlay)
        .with_z_index(3),
        Layer::solid_color(
            Color::new(255, 255, 255, 255),
            Transform::new()
                .with_position(1500.0, 1500.0)
                .with_scale(0.3)
                .with_opacity(0.5),
        )
        .with_z_index(4),
    ]
}

fn bench_simple_composition(c: &mut Criterion) {
    let compositor = Compositor::new(1920, 1080).unwrap();
    let layers = create_simple_layers();

    c.bench_function("simple_composition_3_layers_1080p", |b| {
        b.iter(|| {
            compositor.compose(black_box(&layers)).unwrap();
        });
    });
}

fn bench_complex_composition(c: &mut Criterion) {
    let compositor = Compositor::new(1920, 1080).unwrap();
    let layers = create_complex_layers();

    c.bench_function("complex_composition_10_layers_1080p", |b| {
        b.iter(|| {
            compositor.compose(black_box(&layers)).unwrap();
        });
    });
}

fn bench_highres_composition(c: &mut Criterion) {
    let compositor = Compositor::new(3840, 2160).unwrap();
    let layers = create_highres_layers();

    c.bench_function("highres_composition_5_layers_4k", |b| {
        b.iter(|| {
            compositor.compose(black_box(&layers)).unwrap();
        });
    });
}

fn bench_parallel_composition(c: &mut Criterion) {
    let compositor = Compositor::new(1920, 1080).unwrap();

    let mut group = c.benchmark_group("parallel_composition");

    for frame_count in [10, 50, 100].iter() {
        let frames: Vec<Vec<Layer>> = (0..*frame_count)
            .map(|_| create_simple_layers())
            .collect();

        group.bench_with_input(
            BenchmarkId::new("frames", frame_count),
            &frames,
            |b, frames| {
                b.iter(|| {
                    compositor.compose_batch(black_box(frames.clone())).unwrap();
                });
            },
        );
    }

    group.finish();
}

fn bench_text_rendering(c: &mut Criterion) {
    let compositor = Compositor::new(1920, 1080).unwrap();

    let layers = vec![
        Layer::solid_color(
            Color::new(255, 255, 255, 255),
            Transform::new().with_scale(1.0),
        ),
        Layer::text(
            "Lorem ipsum dolor sit amet".to_string(),
            48.0,
            Color::black(),
            Transform::new().with_position(100.0, 100.0),
        ),
        Layer::text(
            "Consectetur adipiscing elit".to_string(),
            36.0,
            Color::new(50, 50, 50, 255),
            Transform::new().with_position(100.0, 200.0),
        ),
        Layer::text(
            "Sed do eiusmod tempor".to_string(),
            24.0,
            Color::new(100, 100, 100, 255),
            Transform::new().with_position(100.0, 300.0),
        ),
    ];

    c.bench_function("text_rendering_3_text_layers_1080p", |b| {
        b.iter(|| {
            compositor.compose(black_box(&layers)).unwrap();
        });
    });
}

fn bench_blend_modes(c: &mut Criterion) {
    let compositor = Compositor::new(1920, 1080).unwrap();

    let blend_modes = [
        ("normal", BlendMode::Normal),
        ("multiply", BlendMode::Multiply),
        ("screen", BlendMode::Screen),
        ("overlay", BlendMode::Overlay),
        ("add", BlendMode::Add),
        ("subtract", BlendMode::Subtract),
        ("lighten", BlendMode::Lighten),
        ("darken", BlendMode::Darken),
        ("soft_light", BlendMode::SoftLight),
        ("hard_light", BlendMode::HardLight),
        ("color_dodge", BlendMode::ColorDodge),
        ("color_burn", BlendMode::ColorBurn),
        ("difference", BlendMode::Difference),
        ("exclusion", BlendMode::Exclusion),
        ("hue", BlendMode::Hue),
        ("saturation", BlendMode::Saturation),
        ("color", BlendMode::Color),
        ("luminosity", BlendMode::Luminosity),
    ];

    let mut group = c.benchmark_group("blend_modes");

    for (name, blend_mode) in blend_modes.iter() {
        let layers = vec![
            Layer::solid_color(
                Color::new(100, 150, 200, 255),
                Transform::new().with_scale(1.0),
            )
            .with_z_index(0),
            Layer::solid_color(
                Color::new(200, 100, 50, 255),
                Transform::new()
                    .with_position(200.0, 200.0)
                    .with_scale(0.8)
                    .with_opacity(0.9),
            )
            .with_blend_mode(*blend_mode)
            .with_z_index(1),
        ];

        group.bench_with_input(
            BenchmarkId::new("blend_mode", name),
            &layers,
            |b, layers| {
                b.iter(|| {
                    compositor.compose(black_box(layers)).unwrap();
                });
            },
        );
    }

    group.finish();
}

fn bench_effects_pipeline(c: &mut Criterion) {
    use video_compositor::Effect;

    let compositor = Compositor::new(1920, 1080).unwrap();

    let mut group = c.benchmark_group("effects_pipeline");

    // Blur effect
    let blur_layer = Layer::solid_color(
        Color::new(255, 100, 50, 255),
        Transform::new().with_position(100.0, 100.0).with_scale(0.5),
    )
    .with_effects(vec![Effect::Blur { radius: 5.0 }]);

    group.bench_function("blur_radius_5", |b| {
        b.iter(|| {
            compositor.compose(black_box(&vec![blur_layer.clone()])).unwrap();
        });
    });

    // Shadow effect
    let shadow_layer = Layer::solid_color(
        Color::new(255, 100, 50, 255),
        Transform::new().with_position(100.0, 100.0).with_scale(0.5),
    )
    .with_effects(vec![Effect::Shadow {
        offset_x: 10.0,
        offset_y: 10.0,
        blur: 8.0,
        color: [0, 0, 0, 128],
    }]);

    group.bench_function("shadow_effect", |b| {
        b.iter(|| {
            compositor.compose(black_box(&vec![shadow_layer.clone()])).unwrap();
        });
    });

    // Color filter effects (brightness + contrast + saturation)
    let color_filter_layer = Layer::solid_color(
        Color::new(150, 150, 150, 255),
        Transform::new().with_position(100.0, 100.0).with_scale(0.5),
    )
    .with_effects(vec![
        Effect::Brightness { amount: 0.2 },
        Effect::Contrast { amount: 0.3 },
        Effect::Saturation { amount: 0.5 },
    ]);

    group.bench_function("color_filters_combined", |b| {
        b.iter(|| {
            compositor.compose(black_box(&vec![color_filter_layer.clone()])).unwrap();
        });
    });

    // Multiple effects combined
    let multi_effect_layer = Layer::solid_color(
        Color::new(255, 100, 50, 255),
        Transform::new().with_position(100.0, 100.0).with_scale(0.5),
    )
    .with_effects(vec![
        Effect::Blur { radius: 3.0 },
        Effect::Brightness { amount: 0.1 },
        Effect::HueRotate { degrees: 45.0 },
    ]);

    group.bench_function("multi_effect_pipeline", |b| {
        b.iter(|| {
            compositor.compose(black_box(&vec![multi_effect_layer.clone()])).unwrap();
        });
    });

    group.finish();
}

fn bench_animated_composition(c: &mut Criterion) {
    use video_compositor::{AnimatedLayer, Keyframe, EasingFunction};

    let compositor = Compositor::new(1920, 1080).unwrap();

    // Create animated layers with keyframes
    let layer1 = Layer::solid_color(Color::red(), Transform::default());
    let animated1 = AnimatedLayer::new(layer1)
        .with_position_x_keyframes(vec![
            Keyframe::new(0.0, 0.0, EasingFunction::EaseInOut),
            Keyframe::new(1000.0, 500.0, EasingFunction::EaseInOut),
        ])
        .with_opacity_keyframes(vec![
            Keyframe::new(0.0, 1.0, EasingFunction::Linear),
            Keyframe::new(1000.0, 0.5, EasingFunction::Linear),
        ]);

    let layer2 = Layer::solid_color(Color::blue(), Transform::default());
    let animated2 = AnimatedLayer::new(layer2)
        .with_scale_x_keyframes(vec![
            Keyframe::new(0.0, 0.5, EasingFunction::Linear),
            Keyframe::new(1000.0, 1.5, EasingFunction::EaseInOut),
        ])
        .with_rotation_keyframes(vec![
            Keyframe::new(0.0, 0.0, EasingFunction::Linear),
            Keyframe::new(1000.0, 360.0, EasingFunction::Linear),
        ]);

    let layer3 = Layer::solid_color(Color::green(), Transform::default());
    let animated3 = AnimatedLayer::new(layer3)
        .with_position_y_keyframes(vec![
            Keyframe::new(0.0, 100.0, EasingFunction::EaseOut),
            Keyframe::new(1000.0, 500.0, EasingFunction::EaseOut),
        ]);

    let layers = vec![animated1, animated2, animated3];

    c.bench_function("animated_composition_3_layers_at_500ms", |b| {
        b.iter(|| {
            compositor.compose_at_time(black_box(&layers), 500.0).unwrap();
        });
    });
}

fn bench_layer_count_scaling(c: &mut Criterion) {
    let compositor = Compositor::new(1920, 1080).unwrap();

    let mut group = c.benchmark_group("layer_count_scaling");

    for layer_count in [1, 5, 10, 20, 50].iter() {
        let layers: Vec<Layer> = (0..*layer_count)
            .map(|i| {
                Layer::solid_color(
                    Color::new(
                        ((i * 37) % 256) as u8,
                        ((i * 73) % 256) as u8,
                        ((i * 137) % 256) as u8,
                        255,
                    ),
                    Transform::new()
                        .with_position((i * 30) as f32, (i * 30) as f32)
                        .with_scale(0.9 - (i as f32 * 0.01))
                        .with_opacity(1.0 - (i as f32 * 0.015)),
                )
                .with_z_index(i as i32)
            })
            .collect();

        group.bench_with_input(
            BenchmarkId::new("layers", layer_count),
            &layers,
            |b, layers| {
                b.iter(|| {
                    compositor.compose(black_box(layers)).unwrap();
                });
            },
        );
    }

    group.finish();
}

criterion_group!(
    benches,
    bench_simple_composition,
    bench_complex_composition,
    bench_highres_composition,
    bench_parallel_composition,
    bench_text_rendering,
    bench_blend_modes,
    bench_effects_pipeline,
    bench_animated_composition,
    bench_layer_count_scaling
);
criterion_main!(benches);
