#version 330 core

#define EPSILON 0.00005f
#define M_PI 3.141592653f

# define MATERIAL_MTLLIB			(1 << 0)
# define MATERIAL_MAP_SHININESS		(1 << 1)
# define MATERIAL_MAP_NORMAL		(1 << 2)
# define MATERIAL_MAP_SPECULAR		(1 << 3)
# define MATERIAL_MAP_DIFFUSE		(1 << 4)
# define MATERIAL_MAP_AMBIENT		(1 << 5)

# define LIGHT_BASIC				(1 << 0)
# define LIGHT_DIRECTIONNAL			(1 << 1)
# define LIGHT_POINT				(1 << 2)
# define LIGHT_SPOT					(1 << 3)

struct t_material
{
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	float	shininess;
	float	transparency;
	int		texture_ambient;
	int		texture_diffuse;
	int		texture_specular;
	int		texture_shininess;
	int		texture_normal;
	int		flag;
};

struct t_light
{
	vec3	position;
	vec3	direction;
	vec3	ambient;
	vec3	diffuse;
	vec3	specular;
	float	constent;
	float	linear;
	float	quadratic;
	float	spot_little_radius;
	float	spot_big_radius;
	int		type;
};

out vec4 FragColor;

in vec3 position;
in vec2 uv;
in vec3 normal;
in vec3 vn_out;
in vec4 gl_FragCoord;
flat in float vertex_id;

uniform t_light		light;
uniform vec3		cameraPosition;
uniform t_material	material;
uniform sampler2D	testTexture;
uniform float		far;
uniform float		near;
uniform float		time;

float intensityAmbient = 0.15;
vec3 ambient;
vec3 diffuse;
vec3 specular;
vec3 lightColor = vec3(1.f, 1.f, 1.f);
vec3 lightDir;
vec3 cam_to_obj;
vec3 norm;
vec3 resultColor;
float textureTransparency;
vec4 textureAmbient;
t_material newMaterial;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

float rand(float number){
    return fract(number /255.f);
}
vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main()
{
	textureTransparency = 1.f;
	newMaterial = material;
	vec2 abc = random2(vec2(vn_out.z + vn_out.x, vn_out.y));
	//abc.x = rand(vec2 (vn_out.z, vn_out.y));
	abc.x = vertex_id;
	//abc.x = fract(length(vertex_id) * 8750.4568f / 255.f);
	newMaterial.diffuse = vec3(vertex_id);
	newMaterial.ambient = vec3(vertex_id);

	if (newMaterial.texture_diffuse == 1)
	{
		textureAmbient = texture(testTexture, uv);
		newMaterial.diffuse = textureAmbient.rgb;
		newMaterial.ambient = textureAmbient.rgb;
		newMaterial.specular = textureAmbient.rgb;
		/*if (textureAmbient.a < 0.1)
			discard ;
		textureTransparency = texture(testTexture, uv).a;*/
	}

	ambient = newMaterial.ambient * light.ambient;

	norm = normalize(normal);
	if (light.type == LIGHT_DIRECTIONNAL)
		lightDir = normalize(light.direction);
	else
		lightDir = normalize(position - light.position);

	diffuse = max(dot(norm, -lightDir), 0) * newMaterial.diffuse * light.diffuse;

	vec3 reflection = reflect(-lightDir, norm);
	cam_to_obj = normalize(position - cameraPosition);

	float angleReflection = max(dot(-cam_to_obj, reflection), 0.f);
	specular = (pow(angleReflection, newMaterial.shininess) * newMaterial.specular) * light.specular;

	if (light.type == LIGHT_SPOT)
	{

		float theta = dot(lightDir, normalize(light.direction)) * 180 / M_PI;
		float epsilon = (light.spot_little_radius - light.spot_big_radius);
		float intensity = clamp((theta - light.spot_big_radius) / epsilon, 0.0, 1.0);
		diffuse  *= intensity;
		specular *= intensity;
	}

	resultColor = (ambient + diffuse + specular);

	if (light.type == LIGHT_POINT)
	{
		float distance    = length(light.position - position);
		float attenuation = 1.0 / (light.constent + light.linear * distance +
    		    			light.quadratic * (distance * distance));
		resultColor *= attenuation;
	}

	FragColor = vec4(resultColor, textureTransparency);
/*
	float depth = LinearizeDepth(gl_FragCoord.z) / far;
	FragColor = vec4(vec3(depth), 1.f);
*/
	//FragColor = texture(testTexture, uv);
}