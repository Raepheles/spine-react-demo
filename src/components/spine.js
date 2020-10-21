import React from 'react';

/*global spine*/
class Spine extends React.Component {
  constructor() {
    super();
    this.canvas = null;
    this.gl = null;
    this.mvp = new spine.webgl.Matrix4();
    this.assetManager = null;
    this.shader = null;
    this.batcher = null;
    this.skeletonRenderer = null;
    this.characterName = null;
    this.anim = null;

    this.skel = null;
    this.atlas = null;

    this.lastFrameTime = null;
    this.character = null;
  }

  renderFrame = () => {
    let now = Date.now() / 1000;
    let delta = now - this.lastFrameTime;
    if (this.props.timeMultiplier) delta *= this.props.timeMultiplier;
    this.lastFrameTime = now;

    this.resize();

    this.gl.clearColor(1, 0.647, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    const skeleton = this.character.skeleton;
    const state = this.character.state;
    const premultipliedAlpha = this.character.premultipliedAlpha;

    state.update(delta);
    state.apply(skeleton);
    skeleton.updateWorldTransform();

    this.shader.bind();
    this.shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
    this.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, this.mvp.values);

    this.batcher.begin(this.shader);
    this.skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
    this.skeletonRenderer.draw(this.batcher, skeleton);
    this.batcher.end();

    this.shader.unbind();

    requestAnimationFrame(this.renderFrame);
  }

  resize = () => {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    const bounds = this.character.bounds;
    const centerX = bounds.offset.x + bounds.size.x / 1.3;
    const centerY = bounds.offset.y + bounds.size.y / 1.8;
    const scaleX = bounds.size.x / this.canvas.width;
    const scaleY = bounds.size.y / this.canvas.height;
    let scale = Math.max(scaleX, scaleY) * 1.2;
    if (scale < 1) scale = 1;
    const width = this.canvas.width * scale;
    const height = this.canvas.height * scale;
    
    this.mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  calculateSetupPoseBounds = (skeleton) => {
    skeleton.setToSetupPose();
    skeleton.updateWorldTransform();
    const offset = new spine.Vector2();
    const size = new spine.Vector2();
    skeleton.getBounds(offset, size, []);

    return {
      offset,
      size
    };
  }

  loadCharacter = (initialAnimation, premultipliedAlpha) => {
    const atlas = this.assetManager.get(`${this.atlas}`);
    const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
    const skeletonBinary = new spine.SkeletonBinary(atlasLoader);

    skeletonBinary.scale = 1;
    const skeletonData = skeletonBinary.readSkeletonData(this.assetManager.get(this.skel));
    const skeleton = new spine.Skeleton(skeletonData);
    const bounds = this.calculateSetupPoseBounds(skeleton);

    const animationStateData = new spine.AnimationStateData(skeleton.data);
    const animationState = new spine.AnimationState(animationStateData);
    animationState.setAnimation(0, initialAnimation, true);

    return {
      skeleton,
      state: animationState,
      bounds,
      premultipliedAlpha
    };
  }

  load = () => {
    if (this.assetManager.isLoadingComplete()) {
      this.character = this.loadCharacter(this.props.anim, true);
      this.lastFrameTime = Date.now() / 1000;
      requestAnimationFrame(this.renderFrame);
    } else {
      requestAnimationFrame(this.load);
    }
  }

  componentDidUpdate() {
    if (this.characterName !== this.props.character) {
      this.skel = `spines/${this.props.character}/${this.props.character}-pro.skel`;
      this.atlas = `spines/${this.props.character}/${this.props.character}-pro.atlas`;

      this.canvas = document.getElementById(this.props.canvasId);
      const config = { alpha: false };
      this.gl = this.canvas.getContext('webgl', config) || this.canvas.getContext('experimental-webgl', config);
      if (!this.gl) return;
      this.shader = spine.webgl.Shader.newTwoColoredTextured(this.gl);
      this.batcher = new spine.webgl.PolygonBatcher(this.gl);
      this.mvp.ortho2d(0, 0, this.canvas.width - 1, this.canvas.height - 1);
      this.skeletonRenderer = new spine.webgl.SkeletonRenderer(this.gl);
      this.assetManager = new spine.webgl.AssetManager(this.gl);

      this.assetManager.loadBinary(this.skel);
      this.assetManager.loadTextureAtlas(this.atlas);
      this.characterName = this.props.character;
      this.anim = this.props.anim;
      requestAnimationFrame(this.load);
    } else if(this.anim !== this.props.anim) {
      this.anim = this.props.anim;
      requestAnimationFrame(this.load);
    }

  }

  componentDidMount() {
    this.characterName = this.props.character;
    this.anim = this.props.anim;
    this.skel = `spines/${this.props.character}/${this.props.character}-pro.skel`;
    this.atlas = `spines/${this.props.character}/${this.props.character}-pro.atlas`;

    this.canvas = document.getElementById(this.props.canvasId);
    const config = { alpha: false };
    this.gl = this.canvas.getContext('webgl', config) || this.canvas.getContext('experimental-webgl', config);
    if (!this.gl) return;
    this.shader = spine.webgl.Shader.newTwoColoredTextured(this.gl);
    this.batcher = new spine.webgl.PolygonBatcher(this.gl);
    this.mvp.ortho2d(0, 0, this.canvas.width - 1, this.canvas.height - 1);
    this.skeletonRenderer = new spine.webgl.SkeletonRenderer(this.gl);
    this.assetManager = new spine.webgl.AssetManager(this.gl);

    this.assetManager.loadBinary(this.skel);
    this.assetManager.loadTextureAtlas(this.atlas);

    requestAnimationFrame(this.load);
  }

  render() {
    return (<></>);
  }
}

export default Spine;