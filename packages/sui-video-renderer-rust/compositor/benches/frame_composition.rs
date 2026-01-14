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

criterion_group!(
    benches,
    bench_simple_composition,
    bench_complex_composition,
    bench_highres_composition,
    bench_parallel_composition
);
criterion_main!(benches);
