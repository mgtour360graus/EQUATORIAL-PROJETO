(function(){
let translateObjs = {};
const trans = (...a) => {
    return translateObjs[a[0x0]] = a, '';
};
function regTextVar(a, b) {
    var c = ![];
    return d(b);
    function d(k, l) {
        switch (k['toLowerCase']()) {
        case 'title':
        case 'subtitle':
        case 'photo.title':
        case 'photo.description':
            var m = (function () {
                switch (k['toLowerCase']()) {
                case 'title':
                case 'photo.title':
                    return 'media.label';
                case 'subtitle':
                    return 'media.data.subtitle';
                case 'photo.description':
                    return 'media.data.description';
                }
            }());
            if (m)
                return function () {
                    var r, s, t = (l && l['viewerName'] ? this['getComponentByName'](l['viewerName']) : undefined) || this['getMainViewer']();
                    if (k['toLowerCase']()['startsWith']('photo'))
                        r = this['getByClassName']('PhotoAlbumPlayListItem')['filter'](function (v) {
                            var w = v['get']('player');
                            return w && w['get']('viewerArea') == t;
                        })['map'](function (v) {
                            return v['get']('media')['get']('playList');
                        });
                    else
                        r = this['_getPlayListsWithViewer'](t), s = j['bind'](this, t);
                    if (!c) {
                        for (var u = 0x0; u < r['length']; ++u) {
                            r[u]['bind']('changing', f, this);
                        }
                        c = !![];
                    }
                    return i['call'](this, r, m, s);
                };
            break;
        case 'tour.name':
        case 'tour.description':
            return function () {
                return this['get']('data')['tour']['locManager']['trans'](k);
            };
        default:
            if (k['toLowerCase']()['startsWith']('viewer.')) {
                var n = k['split']('.')['map'](function (r) {
                        return r['trim']();
                    }), o = n[0x1];
                if (o) {
                    var p = n['slice'](0x2)['join']('.');
                    return d(p, { 'viewerName': o });
                }
            } else {
                if (k['toLowerCase']()['startsWith']('quiz.') && 'Quiz' in TDV) {
                    var q = undefined, m = (function () {
                            switch (k['toLowerCase']()) {
                            case 'quiz.questions.answered':
                                return TDV['Quiz']['PROPERTY']['QUESTIONS_ANSWERED'];
                            case 'quiz.question.count':
                                return TDV['Quiz']['PROPERTY']['QUESTION_COUNT'];
                            case 'quiz.items.found':
                                return TDV['Quiz']['PROPERTY']['ITEMS_FOUND'];
                            case 'quiz.item.count':
                                return TDV['Quiz']['PROPERTY']['ITEM_COUNT'];
                            case 'quiz.score':
                                return TDV['Quiz']['PROPERTY']['SCORE'];
                            case 'quiz.score.total':
                                return TDV['Quiz']['PROPERTY']['TOTAL_SCORE'];
                            case 'quiz.time.remaining':
                                return TDV['Quiz']['PROPERTY']['REMAINING_TIME'];
                            case 'quiz.time.elapsed':
                                return TDV['Quiz']['PROPERTY']['ELAPSED_TIME'];
                            case 'quiz.time.limit':
                                return TDV['Quiz']['PROPERTY']['TIME_LIMIT'];
                            case 'quiz.media.items.found':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_ITEMS_FOUND'];
                            case 'quiz.media.item.count':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_ITEM_COUNT'];
                            case 'quiz.media.questions.answered':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_QUESTIONS_ANSWERED'];
                            case 'quiz.media.question.count':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_QUESTION_COUNT'];
                            case 'quiz.media.score':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_SCORE'];
                            case 'quiz.media.score.total':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_TOTAL_SCORE'];
                            case 'quiz.media.index':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_INDEX'];
                            case 'quiz.media.count':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_COUNT'];
                            case 'quiz.media.visited':
                                return TDV['Quiz']['PROPERTY']['PANORAMA_VISITED_COUNT'];
                            default:
                                var s = /quiz\.([\w_]+)\.(.+)/['exec'](k);
                                if (s) {
                                    q = s[0x1];
                                    switch ('quiz.' + s[0x2]) {
                                    case 'quiz.score':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['SCORE'];
                                    case 'quiz.score.total':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['TOTAL_SCORE'];
                                    case 'quiz.media.items.found':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_ITEMS_FOUND'];
                                    case 'quiz.media.item.count':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_ITEM_COUNT'];
                                    case 'quiz.media.questions.answered':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_QUESTIONS_ANSWERED'];
                                    case 'quiz.media.question.count':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_QUESTION_COUNT'];
                                    case 'quiz.questions.answered':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['QUESTIONS_ANSWERED'];
                                    case 'quiz.question.count':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['QUESTION_COUNT'];
                                    case 'quiz.items.found':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['ITEMS_FOUND'];
                                    case 'quiz.item.count':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['ITEM_COUNT'];
                                    case 'quiz.media.score':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_SCORE'];
                                    case 'quiz.media.score.total':
                                        return TDV['Quiz']['OBJECTIVE_PROPERTY']['PANORAMA_TOTAL_SCORE'];
                                    }
                                }
                            }
                        }());
                    if (m)
                        return function () {
                            var r = this['get']('data')['quiz'];
                            if (r) {
                                if (!c) {
                                    if (q != undefined) {
                                        if (q == 'global') {
                                            var s = this['get']('data')['quizConfig'], t = s['objectives'];
                                            for (var u = 0x0, v = t['length']; u < v; ++u) {
                                                r['bind'](TDV['Quiz']['EVENT_OBJECTIVE_PROPERTIES_CHANGE'], h['call'](this, t[u]['id'], m), this);
                                            }
                                        } else
                                            r['bind'](TDV['Quiz']['EVENT_OBJECTIVE_PROPERTIES_CHANGE'], h['call'](this, q, m), this);
                                    } else
                                        r['bind'](TDV['Quiz']['EVENT_PROPERTIES_CHANGE'], g['call'](this, m), this);
                                    c = !![];
                                }
                                try {
                                    var w = 0x0;
                                    if (q != undefined) {
                                        if (q == 'global') {
                                            var s = this['get']('data')['quizConfig'], t = s['objectives'];
                                            for (var u = 0x0, v = t['length']; u < v; ++u) {
                                                w += r['getObjective'](t[u]['id'], m);
                                            }
                                        } else
                                            w = r['getObjective'](q, m);
                                    } else {
                                        w = r['get'](m);
                                        if (m == TDV['Quiz']['PROPERTY']['PANORAMA_INDEX'])
                                            w += 0x1;
                                    }
                                    return w;
                                } catch (x) {
                                    return undefined;
                                }
                            }
                        };
                }
            }
            break;
        }
        return function () {
            return '';
        };
    }
    function e() {
        var k = this['get']('data');
        k['updateText'](k['translateObjs'][a], a['split']('.')[0x0]);
        let l = a['split']('.'), m = l[0x0] + '_vr';
        m in this && k['updateText'](k['translateObjs'][a], m);
    }
    function f(k) {
        var l = k['data']['nextSelectedIndex'];
        if (l >= 0x0) {
            var m = k['source']['get']('items')[l], n = function () {
                    m['unbind']('begin', n, this, !![]), e['call'](this);
                };
            m['bind']('begin', n, this, !![]);
        }
    }
    function g(k) {
        return function (l) {
            k in l && e['call'](this);
        }['bind'](this);
    }
    function h(k, l) {
        return function (m, n) {
            k == m && l in n && e['call'](this);
        }['bind'](this);
    }
    function i(k, l, m) {
        for (var n = 0x0; n < k['length']; ++n) {
            var o = k[n], p = o['get']('selectedIndex');
            if (p >= 0x0) {
                var q = l['split']('.'), r = o['get']('items')[p];
                if (m !== undefined && !m['call'](this, r))
                    continue;
                for (var s = 0x0; s < q['length']; ++s) {
                    if (r == undefined)
                        return '';
                    r = 'get' in r ? r['get'](q[s]) : r[q[s]];
                }
                return r;
            }
        }
        return '';
    }
    function j(k, l) {
        var m = l['get']('player');
        return m !== undefined && m['get']('viewerArea') == k;
    }
}
var script = {"layout":"absolute","watermark":false,"id":"rootPlayer","backgroundColor":["#FFFFFF"],"scrollBarMargin":2,"data":{"locales":{"pt":"locale/pt.txt"},"history":{},"displayTooltipInTouchScreens":true,"defaultLocale":"pt","name":"Player741","textToSpeechConfig":{"pitch":1,"speechOnTooltip":false,"stopBackgroundAudio":false,"volume":1,"speechOnInfoWindow":false,"rate":1,"speechOnQuizQuestion":false}},"start":"this.init()","left":589.65,"backgroundColorRatios":[0],"class":"Player","gap":10,"propagateClick":false,"scripts":{"initAnalytics":TDV.Tour.Script.initAnalytics,"setPlayListSelectedIndex":TDV.Tour.Script.setPlayListSelectedIndex,"toggleMeasurement":TDV.Tour.Script.toggleMeasurement,"cleanAllMeasurements":TDV.Tour.Script.cleanAllMeasurements,"stopMeasurement":TDV.Tour.Script.stopMeasurement,"playGlobalAudio":TDV.Tour.Script.playGlobalAudio,"htmlToPlainText":TDV.Tour.Script.htmlToPlainText,"assignObjRecursively":TDV.Tour.Script.assignObjRecursively,"setOverlayBehaviour":TDV.Tour.Script.setOverlayBehaviour,"fixTogglePlayPauseButton":TDV.Tour.Script.fixTogglePlayPauseButton,"setObjectsVisibilityByTags":TDV.Tour.Script.setObjectsVisibilityByTags,"clone":TDV.Tour.Script.clone,"historyGoForward":TDV.Tour.Script.historyGoForward,"setValue":TDV.Tour.Script.setValue,"startMeasurement":TDV.Tour.Script.startMeasurement,"getMediaByName":TDV.Tour.Script.getMediaByName,"historyGoBack":TDV.Tour.Script.historyGoBack,"playGlobalAudioWhilePlayActiveMedia":TDV.Tour.Script.playGlobalAudioWhilePlayActiveMedia,"startPanoramaWithModel":TDV.Tour.Script.startPanoramaWithModel,"getStateTextToSpeech":TDV.Tour.Script.getStateTextToSpeech,"getGlobalAudio":TDV.Tour.Script.getGlobalAudio,"getPlayListsWithMedia":TDV.Tour.Script.getPlayListsWithMedia,"setObjectsVisibilityByID":TDV.Tour.Script.setObjectsVisibilityByID,"getCurrentPlayers":TDV.Tour.Script.getCurrentPlayers,"openLink":TDV.Tour.Script.openLink,"playAudioList":TDV.Tour.Script.playAudioList,"getRootOverlay":TDV.Tour.Script.getRootOverlay,"getCurrentPlayerWithMedia":TDV.Tour.Script.getCurrentPlayerWithMedia,"mixObject":TDV.Tour.Script.mixObject,"textToSpeech":TDV.Tour.Script.textToSpeech,"setModel3DCameraSequence":TDV.Tour.Script.setModel3DCameraSequence,"getAudioByTags":TDV.Tour.Script.getAudioByTags,"setObjectsVisibility":TDV.Tour.Script.setObjectsVisibility,"pauseGlobalAudio":TDV.Tour.Script.pauseGlobalAudio,"setOverlaysVisibility":TDV.Tour.Script.setOverlaysVisibility,"pauseGlobalAudios":TDV.Tour.Script.pauseGlobalAudios,"getPixels":TDV.Tour.Script.getPixels,"getActivePlayersWithViewer":TDV.Tour.Script.getActivePlayersWithViewer,"setModel3DCameraWithCurrentSpot":TDV.Tour.Script.setModel3DCameraWithCurrentSpot,"pauseCurrentPlayers":TDV.Tour.Script.pauseCurrentPlayers,"getActivePlayerWithViewer":TDV.Tour.Script.getActivePlayerWithViewer,"pauseGlobalAudiosWhilePlayItem":TDV.Tour.Script.pauseGlobalAudiosWhilePlayItem,"getActiveMediaWithViewer":TDV.Tour.Script.getActiveMediaWithViewer,"setMediaBehaviour":TDV.Tour.Script.setMediaBehaviour,"getMediaByTags":TDV.Tour.Script.getMediaByTags,"setModel3DCameraSpot":TDV.Tour.Script.setModel3DCameraSpot,"playGlobalAudioWhilePlay":TDV.Tour.Script.playGlobalAudioWhilePlay,"getQuizTotalObjectiveProperty":TDV.Tour.Script.getQuizTotalObjectiveProperty,"unloadViewer":TDV.Tour.Script.unloadViewer,"setMainMediaByName":TDV.Tour.Script.setMainMediaByName,"getPlayListItemIndexByMedia":TDV.Tour.Script.getPlayListItemIndexByMedia,"executeFunctionWhenChange":TDV.Tour.Script.executeFunctionWhenChange,"startPanoramaWithCamera":TDV.Tour.Script.startPanoramaWithCamera,"isComponentVisible":TDV.Tour.Script.isComponentVisible,"executeJS":TDV.Tour.Script.executeJS,"openEmbeddedPDF":TDV.Tour.Script.openEmbeddedPDF,"triggerOverlay":TDV.Tour.Script.triggerOverlay,"getPlayListItemByMedia":TDV.Tour.Script.getPlayListItemByMedia,"init":TDV.Tour.Script.init,"showWindowBase":TDV.Tour.Script.showWindowBase,"executeAudioActionByTags":TDV.Tour.Script.executeAudioActionByTags,"startModel3DWithCameraSpot":TDV.Tour.Script.startModel3DWithCameraSpot,"showWindow":TDV.Tour.Script.showWindow,"loadFromCurrentMediaPlayList":TDV.Tour.Script.loadFromCurrentMediaPlayList,"executeAudioAction":TDV.Tour.Script.executeAudioAction,"quizResumeTimer":TDV.Tour.Script.quizResumeTimer,"_initTTSTooltips":TDV.Tour.Script._initTTSTooltips,"getPlayListItems":TDV.Tour.Script.getPlayListItems,"downloadFile":TDV.Tour.Script.downloadFile,"quizPauseTimer":TDV.Tour.Script.quizPauseTimer,"toggleTextToSpeechComponent":TDV.Tour.Script.toggleTextToSpeechComponent,"setOverlaysVisibilityByTags":TDV.Tour.Script.setOverlaysVisibilityByTags,"_initItemWithComps":TDV.Tour.Script._initItemWithComps,"showPopupPanoramaVideoOverlay":TDV.Tour.Script.showPopupPanoramaVideoOverlay,"setMainMediaByIndex":TDV.Tour.Script.setMainMediaByIndex,"unregisterKey":TDV.Tour.Script.unregisterKey,"setEndToItemIndex":TDV.Tour.Script.setEndToItemIndex,"showPopupPanoramaOverlay":TDV.Tour.Script.showPopupPanoramaOverlay,"createTweenModel3D":TDV.Tour.Script.createTweenModel3D,"getFirstPlayListWithMedia":TDV.Tour.Script.getFirstPlayListWithMedia,"isPanorama":TDV.Tour.Script.isPanorama,"keepCompVisible":TDV.Tour.Script.keepCompVisible,"getPlayListWithItem":TDV.Tour.Script.getPlayListWithItem,"copyToClipboard":TDV.Tour.Script.copyToClipboard,"existsKey":TDV.Tour.Script.existsKey,"takeScreenshot":TDV.Tour.Script.takeScreenshot,"_getPlayListsWithViewer":TDV.Tour.Script._getPlayListsWithViewer,"copyObjRecursively":TDV.Tour.Script.copyObjRecursively,"quizShowScore":TDV.Tour.Script.quizShowScore,"clonePanoramaCamera":TDV.Tour.Script.clonePanoramaCamera,"setComponentsVisibilityByTags":TDV.Tour.Script.setComponentsVisibilityByTags,"isCardboardViewMode":TDV.Tour.Script.isCardboardViewMode,"cloneBindings":TDV.Tour.Script.cloneBindings,"updateDeepLink":TDV.Tour.Script.updateDeepLink,"getPanoramaOverlaysByTags":TDV.Tour.Script.getPanoramaOverlaysByTags,"setCameraSameSpotAsMedia":TDV.Tour.Script.setCameraSameSpotAsMedia,"textToSpeechComponent":TDV.Tour.Script.textToSpeechComponent,"setComponentVisibility":TDV.Tour.Script.setComponentVisibility,"getPanoramaOverlayByName":TDV.Tour.Script.getPanoramaOverlayByName,"sendAnalyticsData":TDV.Tour.Script.sendAnalyticsData,"setDirectionalPanoramaAudio":TDV.Tour.Script.setDirectionalPanoramaAudio,"syncPlaylists":TDV.Tour.Script.syncPlaylists,"setPanoramaCameraWithCurrentSpot":TDV.Tour.Script.setPanoramaCameraWithCurrentSpot,"changeOpacityWhilePlay":TDV.Tour.Script.changeOpacityWhilePlay,"showPopupImage":TDV.Tour.Script.showPopupImage,"changePlayListWithSameSpot":TDV.Tour.Script.changePlayListWithSameSpot,"getOverlaysByGroupname":TDV.Tour.Script.getOverlaysByGroupname,"changeBackgroundWhilePlay":TDV.Tour.Script.changeBackgroundWhilePlay,"quizShowTimeout":TDV.Tour.Script.quizShowTimeout,"showPopupMedia":TDV.Tour.Script.showPopupMedia,"getOverlaysByTags":TDV.Tour.Script.getOverlaysByTags,"createTween":TDV.Tour.Script.createTween,"stopAndGoCamera":TDV.Tour.Script.stopAndGoCamera,"showComponentsWhileMouseOver":TDV.Tour.Script.showComponentsWhileMouseOver,"quizShowQuestion":TDV.Tour.Script.quizShowQuestion,"registerKey":TDV.Tour.Script.registerKey,"autotriggerAtStart":TDV.Tour.Script.autotriggerAtStart,"shareSocial":TDV.Tour.Script.shareSocial,"_initTwinsViewer":TDV.Tour.Script._initTwinsViewer,"getOverlays":TDV.Tour.Script.getOverlays,"_initSplitViewer":TDV.Tour.Script._initSplitViewer,"setMapLocation":TDV.Tour.Script.setMapLocation,"_getObjectsByTags":TDV.Tour.Script._getObjectsByTags,"stopGlobalAudio":TDV.Tour.Script.stopGlobalAudio,"toggleVR":TDV.Tour.Script.toggleVR,"skip3DTransitionOnce":TDV.Tour.Script.skip3DTransitionOnce,"initQuiz":TDV.Tour.Script.initQuiz,"quizStart":TDV.Tour.Script.quizStart,"stopTextToSpeech":TDV.Tour.Script.stopTextToSpeech,"setStartTimeVideoSync":TDV.Tour.Script.setStartTimeVideoSync,"stopGlobalAudios":TDV.Tour.Script.stopGlobalAudios,"getModel3DInnerObject":TDV.Tour.Script.getModel3DInnerObject,"getMediaHeight":TDV.Tour.Script.getMediaHeight,"restartTourWithoutInteraction":TDV.Tour.Script.restartTourWithoutInteraction,"disableVR":TDV.Tour.Script.disableVR,"setMeasurementUnits":TDV.Tour.Script.setMeasurementUnits,"getMediaWidth":TDV.Tour.Script.getMediaWidth,"resumeGlobalAudios":TDV.Tour.Script.resumeGlobalAudios,"setStartTimeVideo":TDV.Tour.Script.setStartTimeVideo,"toggleMeasurementsVisibility":TDV.Tour.Script.toggleMeasurementsVisibility,"getMediaFromPlayer":TDV.Tour.Script.getMediaFromPlayer,"resumePlayers":TDV.Tour.Script.resumePlayers,"visibleComponentsIfPlayerFlagEnabled":TDV.Tour.Script.visibleComponentsIfPlayerFlagEnabled,"setMeasurementsVisibility":TDV.Tour.Script.setMeasurementsVisibility,"setSurfaceSelectionHotspotMode":TDV.Tour.Script.setSurfaceSelectionHotspotMode,"translate":TDV.Tour.Script.translate,"enableVR":TDV.Tour.Script.enableVR,"getComponentsByTags":TDV.Tour.Script.getComponentsByTags,"quizSetItemFound":TDV.Tour.Script.quizSetItemFound,"getComponentByName":TDV.Tour.Script.getComponentByName,"getMainViewer":TDV.Tour.Script.getMainViewer,"quizFinish":TDV.Tour.Script.quizFinish,"updateVideoCues":TDV.Tour.Script.updateVideoCues,"setPanoramaCameraWithSpot":TDV.Tour.Script.setPanoramaCameraWithSpot,"getKey":TDV.Tour.Script.getKey,"updateMediaLabelFromPlayList":TDV.Tour.Script.updateMediaLabelFromPlayList,"setLocale":TDV.Tour.Script.setLocale,"updateIndexGlobalZoomImage":TDV.Tour.Script.updateIndexGlobalZoomImage,"cleanSelectedMeasurements":TDV.Tour.Script.cleanSelectedMeasurements,"initOverlayGroupRotationOnClick":TDV.Tour.Script.initOverlayGroupRotationOnClick},"minWidth":0,"minHeight":0,"xrPanelsEnabled":true,"width":"100%","scrollBarColor":"#000000","height":"100%","hash": "bc23fe46e66040205c6ec770e7b664f5a4a51a2117d47e4a860ae9b93b6e602f", "definitions": [{"id":"mainPlayList","items":[{"camera":"this.panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029_camera","media":"this.panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029","class":"PanoramaPlayListItem","end":"this.trigger('tourEnded')","player":"this.MainViewerPanoramaPlayer"}],"class":"PlayList"},{"thumbnailUrl":"media/panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029_t.avif","class":"Panorama","hfovMin":"120%","hfov":360,"vfov":180,"id":"panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029","frames":[{"thumbnailUrl":"media/panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029_t.avif","class":"CubicPanoramaFrame","cube":{"class":"ImageResource","levels":[{"rowCount":5,"height":5120,"url":"media/panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029_0/{face}/0/{row}_{column}.avif","colCount":30,"tags":"ondemand","class":"TiledImageResourceLevel","width":30720},{"rowCount":3,"height":3072,"url":"media/panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029_0/{face}/1/{row}_{column}.avif","colCount":18,"tags":"ondemand","class":"TiledImageResourceLevel","width":18432},{"rowCount":2,"height":2048,"url":"media/panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029_0/{face}/2/{row}_{column}.avif","colCount":12,"tags":"ondemand","class":"TiledImageResourceLevel","width":12288},{"rowCount":1,"height":1024,"url":"media/panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029_0/{face}/3/{row}_{column}.avif","colCount":6,"tags":["ondemand","preload"],"class":"TiledImageResourceLevel","width":6144}]}}],"hfovMax":130,"data":{"label":"PANO0001 Panorama"},"label":trans('panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029.label')},{"width":"100%","subtitlesTextShadowVerticalLength":1,"toolTipFontColor":"#606060","toolTipBackgroundColor":"#F6F6F6","playbackBarProgressBackgroundColorRatios":[0],"playbackBarBorderColor":"#FFFFFF","playbackBarBorderRadius":0,"subtitlesGap":0,"subtitlesBackgroundColor":"#000000","playbackBarProgressBorderColor":"#000000","vrPointerSelectionTime":2000,"playbackBarHeadBorderRadius":0,"playbackBarHeadBorderColor":"#000000","data":{"name":"Main Viewer"},"playbackBarBorderSize":0,"surfaceReticleColor":"#FFFFFF","progressBackgroundColorRatios":[0],"playbackBarHeadShadowHorizontalLength":0,"subtitlesTextShadowOpacity":1,"progressRight":"33%","subtitlesTop":0,"focusAreaScale":0.7,"progressBarBackgroundColorDirection":"horizontal","progressOpacity":0.7,"playbackBarBackgroundOpacity":1,"subtitlesTextShadowColor":"#000000","playbackBarHeadShadowBlurRadius":3,"subtitlesFontColor":"#FFFFFF","toolTipPaddingLeft":6,"playbackBarLeft":0,"vrPointerColor":"#FFFFFF","progressBarBackgroundColorRatios":[0],"toolTipPaddingBottom":4,"vrPointerSelectionColor":"#FF6600","progressBarBorderColor":"#000000","subtitlesFontSize":"3vmin","playbackBarHeadHeight":15,"playbackBarHeadBackgroundColorRatios":[0,1],"playbackBarHeadShadowColor":"#000000","playbackBarHeadBorderSize":0,"surfaceReticleSelectionColor":"#FFFFFF","progressBorderColor":"#000000","toolTipPaddingRight":6,"subtitlesBackgroundOpacity":0.2,"progressBarBackgroundColor":["#3399FF"],"id":"MainViewer","playbackBarHeadShadow":true,"subtitlesBorderColor":"#FFFFFF","progressBackgroundColor":["#000000"],"vrThumbstickRotationStep":20,"playbackBarHeadBackgroundColor":["#111111","#666666"],"progressBottom":10,"playbackBarBottom":5,"playbackBarHeadShadowVerticalLength":0,"toolTipPaddingTop":4,"progressBorderSize":0,"progressBarBorderSize":0,"class":"ViewerArea","progressBarBorderRadius":2,"firstTransitionDuration":0,"propagateClick":false,"playbackBarHeight":10,"toolTipShadowColor":"#333138","progressHeight":2,"minHeight":50,"playbackBarProgressBorderSize":0,"minWidth":100,"playbackBarBackgroundColor":["#FFFFFF"],"subtitlesBottom":50,"playbackBarHeadWidth":6,"toolTipFontFamily":"Arial","progressBorderRadius":2,"toolTipBorderColor":"#767676","playbackBarProgressBackgroundColor":["#3399FF"],"playbackBarBackgroundColorDirection":"vertical","playbackBarProgressBorderRadius":0,"toolTipFontSize":"1.11vmin","toolTipTextShadowColor":"#000000","height":"100%","progressLeft":"33%","subtitlesTextShadowHorizontalLength":1,"playbackBarRight":0,"playbackBarHeadShadowOpacity":0.7,"subtitlesFontFamily":"Arial"},{"touchControlMode":"drag_rotation","displayPlaybackBar":true,"class":"PanoramaPlayer","id":"MainViewerPanoramaPlayer","mouseControlMode":"drag_rotation","arrowKeysAction":"translate","viewerArea":"this.MainViewer","aaEnabled":true,"keepModel3DLoadedWithoutLocation":true},{"class":"PanoramaCamera","initialPosition":{"pitch":-89.99,"hfov":120,"class":"PanoramaCameraPosition","yaw":0.95},"initialSequence":"this.sequence_6137622D_6A2C_1BCC_41BB_5FCF6D81CB22","id":"panorama_6640CAC4_6A2C_28B3_41B8_1B6E18457029_camera","displayOriginPosition":{"pitch":-90,"hfov":165,"stereographicFactor":1,"class":"RotationalCameraDisplayPosition","yaw":0.95},"displayMovements":[{"duration":2000,"class":"TargetRotationalCameraDisplayMovement"},{"duration":5000,"easing":"cubic_in_out","targetStereographicFactor":0,"class":"TargetRotationalCameraDisplayMovement","targetPitch":-89.99,"targetHfov":120}],"enterPointingToHorizon":true},{"class":"PanoramaCameraSequence","id":"sequence_6137622D_6A2C_1BCC_41BB_5FCF6D81CB22","movements":[{"yawSpeed":7.96,"easing":"cubic_in","yawDelta":18.5,"class":"DistancePanoramaCameraMovement"},{"yawSpeed":7.96,"yawDelta":323,"class":"DistancePanoramaCameraMovement"},{"yawSpeed":7.96,"easing":"cubic_out","yawDelta":18.5,"class":"DistancePanoramaCameraMovement"}]}],"defaultMenu":["fullscreen","mute","rotation"],"children":["this.MainViewer"]};
if (script['data'] == undefined)
    script['data'] = {};
script['data']['translateObjs'] = translateObjs, script['data']['createQuizConfig'] = function () {
    let a = {}, b = this['get']('data')['translateObjs'];
    for (const c in translateObjs) {
        if (!b['hasOwnProperty'](c))
            b[c] = translateObjs[c];
    }
    return a;
}, TDV['PlayerAPI']['defineScript'](script);
//# sourceMappingURL=script_device.js.map
})();
//Generated with v2026.1.2, Fri Oct 23 2026