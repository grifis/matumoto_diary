<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\DiaryRequest;
use App\Http\Requests\ImageRequest;
use App\Models\Diary;
use App\Events\DiaryWrited;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;
use Functions;

class DiaryController extends Controller
{
    public function top(Diary $diary, Request $request)
    {
        $page_number = $request->page;
        return Inertia::render('top', [
            'diaries' => $diary->getByDate(),
            'pageNumber' => $page_number,
        ]);
    }

    public function index(Diary $diary)
    {
        return view('index')->with(['diaries' => $diary->getByDate()]);
    }

    // Vue.jsを使おうとした残骸
    // public function index(Diary $diary)
    // {
    //     return Inertia::render('Index',['diaries' => $diary->get()]);
    // }

    public function show(Diary $diary)
    {
        return view('show')->with(['diary' => $diary]);
    }

    public function create()
    {
        return Inertia::render('Create');
    }

    public function store(DiaryRequest $request, Diary $diary)
    {
        $input_diary = $request->all();
        $input_diary['user_id'] = Auth::id();
        $file = $request->file('image');

        if (isset($file)) {
            $diary->fill($input_diary);
            $diary['image_path'] = $file->store('images/diaries', 'public');
            $diary->save();
        } else {
            $diary->fill($input_diary)->storeImage()->save();
        }

        $page = Diary::where('year', '<', $diary->year)->count();
        $page += Diary::where('year', $diary->year)->where('month', '<', $diary->month)->count();
        $page += Diary::where('year', $diary->year)->where('month', $diary->month)->where('day', '<', $diary->day)->count();

        Functions::toggleSwitch();  //スイッチボット
        event(new DiaryWrited($page));

        return redirect()->route('index', ['page' => $page]);
    }

    public function random()
    {
        $diaries = Diary::all()->pluck('id')->toArray();
        return redirect("/diary/".$diaries[(array_rand($diaries))]);
    }

    // 写真の投稿
    public function upload()
    {
        return Inertia::render('upload');
    }
    public function store_image(ImageRequest $request, Diary $diary)
    {
        $input_diary = $request->all();
        $diary->fill($input_diary);
        $diary['image_path'] = $request->file('image_path')->store('images/diaries', 'public');
        $diary['user_id'] = Auth::id();
        $diary->save();

        $page = Diary::where('year', '<', $diary->year)->count();
        $page += Diary::where('year', $diary->year)->where('month', '<', $diary->month)->count();
        $page += Diary::where('year', $diary->year)->where('month', $diary->month)->where('day', '<', $diary->day)->count();

        Functions::toggleSwitch();  //スイッチボット
        event(new DiaryWrited($page));

        return redirect()->route('index', ['page' => $page]);
    }
}
