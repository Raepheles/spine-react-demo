import React from 'react';
import Spine from './components/spine';
import './assets/css/App.css';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import characters from './assets/characters.json';

class App extends React.Component {
  state = {
    character: characters[0].name,
    animation: '',
    landscape: true,
    timeMultiplier: 1
  }

  handleSliderChange = (ev) => {
    this.setState({
      timeMultiplier: ev.target.value
    })
  }

  handleCharacterSelect = (name, animation) => {
    this.setState({
      character: name,
      animation
    });
  }

  handleAnimationSelect = (animation) => {
    this.setState({
      animation
    });
  }

  getSkeletonDropdownItems() {
    const result = [];
    for (const char of characters) {
      const characterJson = require(`../public/spines/${char.name}/${char.name}-pro.json`);
      const animations = characterJson.animations;
      const temp = <Dropdown.Item
        key={char.name}
        onClick={() => this.handleCharacterSelect(char.name, Object.keys(animations)[0])}
      >{char.name}</Dropdown.Item>
      result.push(temp);
    }
    return (
      <>
        {result}
      </>
    )
  }

  getAnimationDropdownItems() {
    const characterJson = require(`../public/spines/${this.state.character}/${this.state.character}-pro.json`);
    const animations = characterJson.animations;
    const result = [];
    for (const key of Object.keys(animations)) {
      const temp = <Dropdown.Item
        key={key}
        onClick={() => this.handleAnimationSelect(key)}
      >{key}</Dropdown.Item>
      result.push(temp);
    }
    return (
      <>
        {result}
      </>
    )
  }

  componentDidMount() {
    const characterJson = require(`../public/spines/${this.state.character}/${this.state.character}-pro.json`);
    const animations = characterJson.animations;
    this.setState({
      animation: Object.keys(animations)[0]
    });
    if (window.innerHeight > window.innerWidth) {
      this.setState({
        landscape: false
      });
    }
    window.addEventListener('resize', () => {
      if (window.innerHeight > window.innerWidth) {
        this.setState({
          landscape: false,
        });
      } else {
        this.setState({
          landscape: true,
        });
      }
    });
  }

  getLandscapeLayout() {
    return (
      <div className="row h-100 no-pad">
        <div className="col-8 bg-orange p-0 d-flex">
          <canvas id="canvas"></canvas>
        </div>
        <div id="controllerDiv" className="col-4 bg-yellow no-pad">
          <div className="row w-100 no-pad text-center pb-5 pt-5">
            <div className="col w-auto">
              Select Skeleton
            </div>
            <div className="col w-auto">
              <DropdownButton id="skeleton-selector" title={this.state.character} >
                {this.getSkeletonDropdownItems()}
              </DropdownButton>
            </div>
          </div>
          <div className="row w-100 no-pad text-center pb-5">
            <div className="col-6">
              Select Skeleton
            </div>
            <div className="col-6">
              <DropdownButton id="animation-selector" title={this.state.animation} >
                {this.getAnimationDropdownItems()}
              </DropdownButton>
            </div>
          </div>
          <div className="row w-100 no-pad text-center">
            <div className="col-6">
              <input type="range" min="0.1" max="5" value={this.state.timeMultiplier} onChange={this.handleSliderChange} step="0.1" />
            </div>
            <div className="col-6">
              Time multiplier: {this.state.timeMultiplier}
            </div>
          </div>
        </div>
      </div>
    )
  }

  getPortraitLayout() {
    return (
      <div className="column h-100 no-pad">
        <div className="row h-75 bg-orange no-pad">
          <canvas id="canvas"></canvas>
        </div>
        <div id="controllerDiv" className="row h-25 bg-yellow no-pad">
          <div className="row w-100 no-pad text-center">
            <div className="col-4"></div>
            <div className="col-2">
              Select Skeleton
            </div>
            <div className="col-3">
              <DropdownButton id="skeleton-selector" title={this.state.character} >
                {this.getSkeletonDropdownItems()}
              </DropdownButton>
            </div>
            <div className="col-3"></div>
          </div>
          <div className="row w-100 no-pad text-center">
            <div className="col-4"></div>
            <div className="col-2">
              Select Skeleton
            </div>
            <div className="col-3">
              <DropdownButton id="animation-selector" title={this.state.animation} >
                {this.getAnimationDropdownItems()}
              </DropdownButton>
            </div>
            <div className="col-3"></div>
          </div>
          <div className="row w-100 no-pad text-center">
            <div className="col-4"></div>
            <div className="col-2">
              <input type="range" min="0.1" max="5" value={this.state.timeMultiplier} onChange={this.handleSliderChange} step="0.1" />
            </div>
            <div className="col-3">
              Time multiplier: {this.state.timeMultiplier}
            </div>
            <div className="col-3"></div>
          </div>

        </div>
      </div>
    )
  }

  render() {
    return (
      <div className="App">
        <div className="container-fluid h-100 p-0">
          {this.state.landscape ? this.getLandscapeLayout() : this.getPortraitLayout()}
        </div>
        <Spine
          canvasId="canvas"
          character={this.state.character}
          anim={this.state.animation}
          timeMultiplier={this.state.timeMultiplier}
        />
      </div>
    );
  }
}

export default App;
