import React, { useRef, useState, useEffect } from "react"
import { Link, Head } from '@inertiajs/inertia-react';
import './css/main.css';
import Book1 from './css//image/white-diary.jpg';
import Book2 from './css//image/IMG_4376.jpg';
import Poster from './css//image/poster.png';
import Poster2 from './css//image/diary-top.jpg';
import HTMLFlipBook from 'react-pageflip';
import styled from 'styled-components';
import CreateForm from './CreateForm';
import { Inertia } from '@inertiajs/inertia';
import { useMedia } from "react-use";



export default function Top(props) {
    const isWide = useMedia("(min-width: 440px)"); // useMediaの指定の仕方を修正
    //画面がロードされた時に行う処理
    useEffect(() => {
        arryDivide(dummyArr, 10); //tenDividedDiariesというstateに10個ずつ日記データを入れていく

        //Pusherの処理。新しく投稿投稿されたら反応
        Echo.channel('chat').listen('DiaryWrited', e => {
            //投稿されたページまでめくっていく
            flipMany(tenDividedDiaries.length + props.diaries.length + 3);
        });

        //画面幅取得用関数
        const onResize = () => {
            setWindowDimensions(getWindowDimensions());
        }

        //画面幅が変わったらセットし直す
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    //画面の幅と高さを取得するやつ
    const getWindowDimensions = () => {
        const { innerWidth: width, innerHeight: height } = window;
        return {
            width,
            height
        };
    }

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions()); //高さと横幅をstateに入れる

    //ここからstyled-component。つまりcss。

    //日記の画像用
    const ImgStyle = styled.img`
        width: ${windowDimensions.width * 0.64 * 0.5}px;
        height:${windowDimensions.height * 0.90}px;
    `;

    const SpImgStyle = styled.img`
        width: ${windowDimensions.width * 0.9}px;
        height:${windowDimensions.width * 0.9 * 1.5}px;
    `;

    //日記のやつ
    const BookStyle = styled.div`
        margin: 3vh 17vw 0vh 17vw;
    `;

    const SpBookStyle = styled.div`
        margin: 3vh 5vw 0vh 5vw;
    `;

    //白背景
    const WhiteStyle = styled.div`
        background-color: white;
        text-align: center;
    `;

    const [tenDividedDiaries, setTenDividedDiaries] = useState([]); //日記用データを分割して入れるstate

    const dummyArr = [].concat(props.diaries);  //日記用データのコピー。これに破壊的変更を加えていく。

    //配列を分割してtenDivideDiariesに代入していく関数
    function arryDivide(arr, num) {
        let tmpArr;  //10個ずつ切り取ったやつ
        let tmpDivide = []; //一時的に10個ずつ日記データを入れていく配列
        while (arr.length > 0) { //日記用データがある限り10個ずつ分割していく
            tmpArr = arr.splice(0, num);
            tmpDivide.push(tmpArr);
        }
        setTenDividedDiaries(tmpDivide);
    }

    const [flipSpeed, setFlipSpeed] = useState(400); //flipをめくる速度をstateで管理しようと思ったけどできなかった。


    const  book  =  useRef () ;  //本のページをめくるのに必要

    //引数のページに飛んでいく。アニメーションは1めくり。
    function flip (n) {
        book.current.pageFlip().flip(n)
    }

    //引数の数だけめくる。第2引数はめくる速度
    async function flipMany(n, speed=1000)  {
        for (let i of [...Array(Number(n))]) {
            book.current.pageFlip().flipNext(); //次のフリップへ（アニメーション付き）
            await sleep(speed); //デフォルトなら
        }
    }

    function randomOpen() {
        const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
        const randomNumber =randRange(1, Number(props.diaries.length));
        flipMany(2 + (Number(tenDividedDiaries.length) + randomNumber)/2, 280 );
    }

    //引数に入力した数字だけ動作を停止
    const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );

    function FadeInLinkClick() {
        const frame = document.getElementById("fadeLayer");
        frame.className = "FadeInFrame fadein";
        frame.style.visibility = "visible";
        frame.addEventListener('transitionend', () => {
            FadeOut();
        })
    }

    function FadeOut() {
        const frame = document.getElementById("fadeLayer");
        frame.className = "FadeInFrame";
        frame.style.visibility = "hidden";
    }

    const pc = (
        <div className='content'>
            <div className="paper">
                <img src={Poster2} alt="" />
            </div>
            <BookStyle>
                <HTMLFlipBook
                    usePortrait={false}
                    width={windowDimensions.width * 0.64 * 0.5}
                    height={windowDimensions.height * 0.90}
                    showCover={true}
                    drawShadow={true}
                    ref={book}
                    flippingTime={flipSpeed}
                    onInit={()=> {
                        if(props.pageNumber){
                            flipMany(Math.trunc((Number(props.pageNumber) + 3 + Number(tenDividedDiaries.length))/2), 280);
                        }
                    }}
                >
                    <div className="demoPage"><ImgStyle src={Poster}/></div>
                    <div className="demoPage"><ImgStyle src={Poster2}/></div>
                    <WhiteStyle>
                        <div class="menu-1">
                            <div>
                                <button  onClick={() => flip(2)}>
                                    <h1 class="menu">一覧を見る</h1>
                                </button>
                                <p>
                                    『松本家架空日記』の目次までページがめくられます
                                </p>
                            </div>
                        </div>

                        <div class="menu-2">
                            <div>
                                <button  onClick={randomOpen}>
                                    <h1 class="menu">日記を開く</h1>
                                </button>
                                <p>
                                    投稿された架空日記がランダムに開かれます
                                </p>
                            </div>
                        </div>
                        
                        <div class="menu-3">
                            <div>
                                <button onClick={async() => {
                                    flip(3);
                                    await sleep(1000);
                                    Inertia.get('/diary/create')
                                }}>
                                    <h1  class="menu">日記を書く</h1>
                                </button>
                                <p>
                                    ユーザー登録の後に日記を投稿することができます
                                </p>
                            </div>
                        </div>
                        <div class="menu-4">
                            <div>
                                <button onClick={async() => {
                                    Inertia.get('/register')
                                }}>
                                    <h1  class="menu">ユーザー登録</h1>
                                </button>
                                <p>
                                    日記を投稿するための名前を記入することができます
                                </p>
                            </div>
                        </div>
                    </WhiteStyle>
                    {tenDividedDiaries.map((diaries, index) => (
                        <WhiteStyle>
                            <div class="index">
                                <h1>目次</h1>
                            {diaries.map((diary, i) => (
                                <div class="index-title">
                                    <button onClick={() => {flip(index*10 + 3 + tenDividedDiaries.length + i)}}>{diary.title}</button>
                                </div>
                            ))}
                            </div>
                        </WhiteStyle>
                    ))}

                    {props.diaries.map((diary, index)=> (
                        <WhiteStyle className="demoPage">
                            <ImgStyle src={diary.image_path}/>
                        </WhiteStyle>
                    ))}

                    <div className="demoPage"><ImgStyle src={Book1}></ImgStyle></div>
                </HTMLFlipBook>
            </BookStyle>
            {/* <button onClick={()=> {flip(2)}}>目次</button> */}
        </div>
    );

    const smartphone = (
        <div className='content'>
            <SpBookStyle>
                <HTMLFlipBook
                    width={windowDimensions.width * 0.9}
                    height={windowDimensions.width * 0.9 * 1.5}
                    showCover={true}
                    drawShadow={true}
                    ref={book}
                    flippingTime={flipSpeed}
                    onInit={()=> {
                        if(props.pageNumber){
                            flipMany(Math.trunc((Number(props.pageNumber) + 3 + Number(tenDividedDiaries.length))/2), 280);
                        }
                    }}
                >
                    <div className="demoPage"><SpImgStyle src={Poster}/></div>
                    <div className="demoPage"><SpImgStyle src={Top}/></div>
                    <WhiteStyle>
                    </WhiteStyle>
                    {tenDividedDiaries.map((diaries, index) => (
                        <WhiteStyle>
                            {diaries.map((diary, i) => (
                                <div>
                                    <button onClick={() => {flip(index*10 + 3 + tenDividedDiaries.length + i)}}>{diary.title}</button>
                                    <button>{index*10 + 3 + tenDividedDiaries.length + i}</button>
                                </div>
                            ))}
                        </WhiteStyle>
                    ))}

                    {props.diaries.map((diary, index)=> (
                        <WhiteStyle className="demoPage">
                            <SpImgStyle src={diary.image_path}/>
                        </WhiteStyle>
                    ))}
                    <div className="demoPage"><ImgStyle src={Book2}></ImgStyle></div>
                    <div className="demoPage"><ImgStyle src={Book2}></ImgStyle></div>
                    <CreateForm/>
                    <CreateForm/>
                    <CreateForm/>
                    <CreateForm/>
                    <CreateForm/>
                </HTMLFlipBook>
            </SpBookStyle>
            {/* <button onClick={()=> {flip(2)}}>目次</button> */}
        </div>
    );

    return <>
        {isWide ? pc : smartphone}
    </> ;
}
