import { Component } from '../../ecs';
import { AnimationGraph } from "./animation-graph";
import { SamplingState } from "../../assets/animation-clip";

export default class AnimatorComponent extends Component {
  onInit() {
    /**
     * @type {AnimationGraph}
     * @ignore
     */
    this._animationGraph = new AnimationGraph();

    /**
     * @type {Skeleton}
     * @ignore
     */
    this._skeleton = null;

    /**
     * @type {SamplingState}
     * @ignore
     */
    this._samplingState = null;

    this._system.add(this);

    let animation = this._entity.getComp("Animation");
    this._skeleton = animation.skeleton;
    this._samplingState = new SamplingState(this._skeleton);

    animation._animCtrl._current = null;
    animation._animCtrl._next = null;
  }

  onDestroy() {
    this._system.remove(this);
  }

  get skeleton () {
    return this._skeleton;
  }

  get animationGraph() {
    return this._animationGraph;
  }

  update(dt) {
    this._animationGraph.update(dt);
    let blendTask = this._animationGraph._switchTask;
    if (blendTask.animationCount == 0) // no clip
      return;

    this._samplingState.reset();
    for (let i = 0; i < blendTask.animationCount; ++i) {
      let weightCoff = blendTask.getMotionWeight(i);
      if (weightCoff <= 0)
        continue;
      let blendItem = blendTask.getItem(i);
      let motionTime = blendTask.getMotionTime(i);
      blendItem.clip.blendedSample(this._samplingState, motionTime, blendItem.weight * weightCoff);
    }
    this._samplingState.apply();
  }
}