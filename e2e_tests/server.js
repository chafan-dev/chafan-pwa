const express = require('express')
const cors = require('cors');
const enableWs = require('express-ws')
const process = require('process');

const port = 4582

const app = express()
app.use(cors())
app.options('*', cors())

let server = null;
if (process.argv.includes("--secure")) {
  console.log("HTTPS mode");
  var https = require('https');
  var fs = require("fs");
  var httpsOptions = {
    cert: fs.readFileSync("localhost.pem"),
    key: fs.readFileSync("localhost-key.pem"),
  }
  server = https.createServer(httpsOptions, app);
  enableWs(app, server);
} else {
  enableWs(app);
}

app.ws('/ws', (req, res) => {

})

example_user1 = {
  uuid: "example-user-1-uuid",
  handle: "example-user-1",
  full_name: null,
  karma: 0
}

example_user2 = {
  uuid: "example-user-2-uuid",
  handle: "example-user-2",
  full_name: null,
  karma: 2791
}

example_site = {
  description: "讨论互联网产品的设计和体验",
  uuid: "3noQmrdUbubY9ojPerYA",
  name: "互联网产品",
  subdomain: "internet-things",
  public_readable: true,
  public_writable_question: true,
  public_writable_answer: true,
  public_writable_comment: true,
  create_question_coin_deduction: 2,
  addable_member: true,
  topics: [],
  moderator: example_user2,
  permission_type: "public"
}

example_question_preview  = {
  "uuid": "6gpPVpfHJnEh4NfbZ4VY",
  "title": "Twitter, Facebook 类型的社交网络在未来会不会变成政府依靠税收运营的公共基础设施？",
  "description": null,
  "site": example_site,
  "is_placed_at_site_top": false,
  "is_placed_at_home": false,
  "created_at": "2021-02-02T20:02:56.170487+00:00",
  "answers_count": 11
}

example_answer1_preview = {
  "uuid": "3b4TBWxFUnBe4aRrKq4X",
  "author": example_user1,
  "question": example_question_preview,
  "body": "我认为未来一段时间政府不会依靠税收运营社交网络。\n\n政府税收...",
  "upvotes_count": 2,
  "is_hidden_by_moderator": false,
  "is_placed_at_question_top": false
}

const EXAMPLE_USER1_SUBMISSION1_UUID = 'example-user1-submission1';

const example_user2_comment1 = {
  "uuid": "example-comment-1-uuid",
  "updated_at": "2021-03-05T20:17:40.139503+00:00",
  "body": "这是一条测试评论\n",
  "shared_to_timeline": true,
  "is_deleted": false,
  "upvotes_count": 1,
  "author": example_user2,
  "root_route": `/submissions/${EXAMPLE_USER1_SUBMISSION1_UUID}`,
  "upvoted": false
}

const example_user1_submission1 = {
  "uuid": EXAMPLE_USER1_SUBMISSION1_UUID,
  "title": "知乎提交赴美 IPO 申请",
  "description": "\n",
  "url": "https://readhub.cn/topic/84nlE5nwJaO",
  "created_at": "2021-03-05T19:30:54.694708+00:00",
  "updated_at": "2021-03-05T19:30:57.482069+00:00",
  "topics": [],
  "upvotes_count": 0,
  "author": example_user1,
  "comments": [example_user2_comment1],
  "site": {
    "description": "讨论互联网产品的设计和体验",
    "uuid": "3noQmrdUbubY9ojPerYA",
    "name": "互联网产品",
    "subdomain": "internet-things",
    "public_readable": true,
    "public_writable_question": true,
    "public_writable_answer": true,
    "public_writable_comment": true,
    "create_question_coin_deduction": 2,
    "addable_member": true,
    "topics": [],
    "auto_approval": true,
    "min_karma_for_application": null,
    "email_domain_suffix_for_application": "",
    "moderator": example_user1,
    "permission_type": "public",
    "questions_count": 6,
    "submissions_count": 4,
    "members_count": 7
  },
  "upvoted": false,
  "view_times": 2
};

const example_comment_submission_activity = {
  "id": 2649,
  "site_uuid": null,
  "created_at": "2021-03-05T20:17:40.139503+00:00",
  "verb": "comment_submission",
  "content": null,
  "event": {
    "created_at": "2021-03-05T20:17:40.139503+00:00",
    "content": {
      "verb": "comment_submission",
      "subject": example_user2,
      "comment": example_user2_comment1,
      "submission": example_user1_submission1,
    }
  }
}


const exmaple_create_submission_activity = {
  "id": 2650,
  "site_uuid": null,
  "created_at": "2021-03-05T20:19:07.513861+00:00",
  "verb": "create_submission",
  "content": null,
  "event": {
    "created_at": "2021-03-05T20:19:07.513861+00:00",
    "content": {
      "verb": "create_submission",
      "subject": example_user1,
      "submission": example_user1_submission1
    }
  }
};

const example_activity = {
  "id": 1393,
  "site_uuid": null,
  "created_at": "2021-02-06T20:31:09.965902+00:00",
  "verb": "answer_question",
  "content": null,
  "event": {
      "created_at": "2021-02-06T20:31:09.965902+00:00",
      "content": {
          "verb": "answer_question",
          "subject": example_user1,
          "answer": example_answer1_preview,
      }
  }
}

const example_activity_upvote_question1 = {
  "id": 1394,
  "site_uuid": null,
  "created_at": "2021-02-06T20:31:09.965902+00:00",
  "verb": "upvote_question",
  "content": null,
  "event": {
      "created_at": "2021-02-06T20:31:09.965902+00:00",
      "content": {
          "verb": "upvote_question",
          "subject": example_user1,
          "question": example_question_preview,
      }
  }
}


const example_activity_upvote_question2 = {
  "id": 1395,
  "site_uuid": null,
  "created_at": "2021-02-06T20:31:09.965902+00:00",
  "verb": "upvote_question",
  "content": null,
  "event": {
      "created_at": "2021-02-06T20:31:09.965902+00:00",
      "content": {
          "verb": "upvote_question",
          "subject": example_user2,
          "question": example_question_preview,
      }
  }
}


app.post("/api/v1/ws/token", (req, res) => {
  res.json({
    msg: "example-ws-token",
  })
})

app.post("/api/v1/login/access-token", (req, res) => {
  res.json({
    access_token: 'access-token'
  })
})

app.get("/api/v1/me/moderated-sites/", (req, res) => {
  res.json([]);
})

const userProfile = {
  id: 1,
  uuid: "example-uuid",
  email: "test@cha.fan",
  is_active: true,
  is_superuser: false,
  handle: "test",
  moderated_sites: [],
  subscribed_topics: [],
  residency_topics: [],
  profession_topic: {
    uuid: "topic1",
    name: "Topic 1",
  },
  remaining_coins: 12,
  view_times: 10,
  enable_deliver_unread_notifications: true,
}

app.get("/api/v1/me", (req, res) => {
  res.json(userProfile);
})


app.put("/api/v1/me", (req, res) => {
  res.json(userProfile);
})

app.get("/api/v1/me/site-profiles/", (req, res) => {
  res.json([]);
})

example_answer1 = {
  "uuid": "3b4TBWxFUnBe4aRrKq4X",
  "updated_at": "2021-02-06T20:37:28.104656+00:00",
  "body": "我认为未来一段时间政府不会依靠税收运营社交网络。\n\n政府税收运营对社交网路有两点影响。\n\n- 对公司决策产生制约\n- 对这些公司全球化有负面效应\n\n因此只有当大公司开始有衰退迹象并且做不好全球化的时候才会让政府当冤大头。未来一段时间还看不到这个现象。\n",
  "is_published": true,
  "draft_saved_at": null,
  "editor": "wysiwyg",
  "math_enabled": false,
  "source_format": "markdown",
  "upvotes_count": 2,
  "is_hidden_by_moderator": false,
  "is_placed_at_question_top": false,
  "comments": [],
  "author": example_user1,
  "question": example_question_preview,
  "site": example_site,
  "upvoted": true,
  "comment_writable": true,
  "bookmark_count": 0,
  "bookmarked": false,
  "view_times": 4
}


app.get("/api/v1/me/article-columns/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/submissions/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/me/pending-questions/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/answers/3b4TBWxFUnBe4aRrKq4X", (req, res) => {
  res.json(example_answer1)
});

app.get("/api/v1/reactions/answer/3b4TBWxFUnBe4aRrKq4X", (req, res) => {
  res.json({
    counters: {},
    my_reactions: [],
  })
});

app.post("/api/v1/answers/3b4TBWxFUnBe4aRrKq4X/views/", (req, res) => {

});

app.get("/api/v1/activities/", (req, res) => {
  if(req.query.before_activity_id === undefined) {
    res.json([
      example_activity,
      example_activity_upvote_question1,
      example_activity_upvote_question2,
      example_comment_submission_activity,
      exmaple_create_submission_activity,
    ]);
  } else {
    res.json([]);
  }
})


app.get("/api/v1/notifications/unread/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/home/questions/", (req, res) => {
  res.json([]);
})

app.get("/api/v1/me/follows/example-user-1-uuid", (req, res) => {
  res.json({
    user_uuid: 'example-user-1-uuid',
    followers_count: 0,
    followed_count: 0,
    followed_by_me: false,
  })
})

if (server) {
  server.listen(port, () => {
    console.log(`Example app listening at https://localhost:${port}`);
  })
} else {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}