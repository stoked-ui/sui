import { expect } from 'chai';
import EditorFile, { IEditorFile } from '../src/EditorFile/EditorFile';

describe('EditorFile', () => {
  it('should create an instance with default properties', () => {
    const file = new EditorFile();
    
    expect(file).to.be.instanceOf(EditorFile);
    expect(file.tracks).to.be.an('array');
    expect(file.tracks.length).to.equal(0);
  });
  
  it('should create an instance with provided tracks', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Video Track',
        type: 'video',
        actions: [
          { 
            id: 'action-1', 
            start: 0, 
            duration: 10, 
            name: 'Intro Clip'
          }
        ]
      }
    ];
    
    const file = new EditorFile({ tracks });
    
    expect(file).to.be.instanceOf(EditorFile);
    expect(file.tracks).to.be.an('array');
    expect(file.tracks.length).to.equal(1);
    expect(file.tracks[0].id).to.equal('track-1');
    expect(file.tracks[0].name).to.equal('Video Track');
    expect(file.tracks[0].type).to.equal('video');
    expect(file.tracks[0].actions).to.be.an('array');
    expect(file.tracks[0].actions.length).to.equal(1);
    expect(file.tracks[0].actions[0].id).to.equal('action-1');
    expect(file.tracks[0].actions[0].start).to.equal(0);
    expect(file.tracks[0].actions[0].duration).to.equal(10);
    expect(file.tracks[0].actions[0].name).to.equal('Intro Clip');
  });
  
  it('should add a track', () => {
    const file = new EditorFile();
    
    const track = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      actions: []
    };
    
    file.addTrack(track);
    
    expect(file.tracks.length).to.equal(1);
    expect(file.tracks[0].id).to.equal('track-1');
  });
  
  it('should remove a track by id', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Video Track',
        type: 'video',
        actions: []
      },
      {
        id: 'track-2',
        name: 'Audio Track',
        type: 'audio',
        actions: []
      }
    ];
    
    const file = new EditorFile({ tracks });
    
    file.removeTrack('track-1');
    
    expect(file.tracks.length).to.equal(1);
    expect(file.tracks[0].id).to.equal('track-2');
  });
  
  it('should add an action to a track', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Video Track',
        type: 'video',
        actions: []
      }
    ];
    
    const file = new EditorFile({ tracks });
    
    const action = {
      id: 'action-1',
      start: 0,
      duration: 10,
      name: 'Intro Clip'
    };
    
    file.addAction('track-1', action);
    
    expect(file.tracks[0].actions.length).to.equal(1);
    expect(file.tracks[0].actions[0].id).to.equal('action-1');
  });
  
  it('should remove an action from a track', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Video Track',
        type: 'video',
        actions: [
          { 
            id: 'action-1', 
            start: 0, 
            duration: 10, 
            name: 'Intro Clip'
          },
          { 
            id: 'action-2', 
            start: 12, 
            duration: 8, 
            name: 'Main Segment'
          }
        ]
      }
    ];
    
    const file = new EditorFile({ tracks });
    
    file.removeAction('track-1', 'action-1');
    
    expect(file.tracks[0].actions.length).to.equal(1);
    expect(file.tracks[0].actions[0].id).to.equal('action-2');
  });
}); 