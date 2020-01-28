const glsl = x => x;
export default glsl`
#define SHADER_NAME terrain-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D bitmapTexture;
uniform sampler2D elevationBitmapTexture;

uniform float cutoffHeightM;
uniform float peakHeightM;
varying vec2 vTexCoord;
uniform float desaturate;
uniform vec4 transparentColor;
uniform vec3 tintColor;
uniform float opacity;
uniform vec4 bounds;

// apply desaturation
vec3 color_desaturate(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333;
  return mix(color, vec3(luminance), desaturate);
}
// apply tint
vec3 color_tint(vec3 color) {
  return color * tintColor;
}
// blend with background color
vec4 apply_opacity(vec3 color, float alpha) {
  return mix(transparentColor, vec4(color, 1.0), alpha);
}

// compute height
float compute_height_m(vec4 color) {
  float r = color.r * 256.;
  float g = color.g * 256.;
  float b = color.b * 256.;
  float height_m = -10000. + ((r * 256. * 256. + g * 256. + b) * 0.1); 
  return height_m;
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float colormap_f1(int formula, float x) {
  return 1.0;
}

vec4 colormap(float x, int red_type, int green_type, int blue_type) {
  return vec4(colormap_f1(red_type, x), colormap_f1(green_type, x), colormap_f1(blue_type, x), 1.0);
}

void main(void) {
  vec4 bitmapColor = texture2D(bitmapTexture, vTexCoord);
  vec4 elevationColor = texture2D(elevationBitmapTexture, vTexCoord);
  float elevationM = compute_height_m(elevationColor);
  
  // transparent over water
  // if (elevationM < cutoffHeightM) {
  //   discard;
  // }
  
  // height = 0.0 + (height - minM) * (1.0 - 0.0) / (500.0 - minM);
  float mappedElevation = map(elevationM, cutoffHeightM, peakHeightM, 0., 1.);

  gl_FragColor = apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * opacity);

//   if (elevationM < 40. || elevationM > 165.) {
//     gl_FragColor = gl_FragColor * vec4(1.0, 1.0, 1.0, 0.2);
//   }

//   if (bounds.x < -122.5) {
//       discard;
//   }

//   if ((mod(floor(elevationM), 200.) <= 100.)) {
//     gl_FragColor = gl_FragColor * vec4(0.0, 0.0, 0.0, 0.1);
//   }
  //   gl_FragColor = vec4(1.0, 0.5, 0.5, 1.0);
  // gl_FragColor = colormap(mappedElevation, 23, 28, 3);
  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`[0];
;
