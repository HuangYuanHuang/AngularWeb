using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AngularWeb.Models;
namespace AngularWeb.Controllers
{
    public class CanvasController : Controller
    {
        // GET: Canvas
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult List()
        {
            var lineModel = new LineModel() { Color = "red", TagName = "位号1" };
            Random rand = new Random();
            for (int i = 0; i < 59; i++)
            {
               
                lineModel.Data.Add(new LineDataNode()
                {
                    Value = i*rand.Next(-10, 20),
                    Time = $"2016-10-19 08:{rand.Next(0,60).ToString("D2")}:00"
                });
            }
           
            lineModel.SetMinMaxValue();
            return Json(new[] { lineModel });
        }
    }
}